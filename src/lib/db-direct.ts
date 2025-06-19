import { Pool } from 'pg'

// Create a direct PostgreSQL connection that bypasses Prisma
// This is specifically for authentication to avoid pooler issues

let pool: Pool | null = null

export function getDirectPool() {
  if (!pool) {
    let connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
    
    if (!connectionString) {
      throw new Error('No database connection string found')
    }
    
    // For Supabase, ensure SSL mode is set
    if (!connectionString.includes('sslmode=') && connectionString.includes('supabase')) {
      connectionString += connectionString.includes('?') ? '&sslmode=require' : '?sslmode=require'
    }
    
    const isProduction = process.env.NODE_ENV === 'production'
    
    pool = new Pool({
      connectionString,
      ssl: isProduction ? { 
        rejectUnauthorized: false
      } : false,
      // Disable prepared statements for pgBouncer compatibility
      max: 1,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 10000,
    })
  }
  
  return pool
}

export async function queryDirect(text: string, params?: any[]) {
  const pool = getDirectPool()
  try {
    const result = await pool.query(text, params)
    return result
  } catch (error) {
    console.error('Direct query error:', error)
    throw error
  }
}