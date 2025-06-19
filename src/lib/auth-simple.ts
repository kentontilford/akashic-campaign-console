import bcrypt from 'bcryptjs'
import { queryDirect } from './db-direct'

export async function authenticateUser(email: string, password: string) {
  try {
    console.log('[Auth] Attempting authentication for:', email)
    
    // Use parameterized query to prevent SQL injection
    const query = 'SELECT id, email, password, name, role, "emailVerified" FROM "User" WHERE email = $1 LIMIT 1'
    const result = await queryDirect(query, [email])
    
    if (!result.rows || result.rows.length === 0) {
      console.log('[Auth] User not found')
      return null
    }
    
    const user = result.rows[0]
    console.log('[Auth] User found:', { email: user.email, role: user.role })
    
    if (!user.password) {
      console.log('[Auth] User has no password')
      return null
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    console.log('[Auth] Password validation:', isPasswordValid)
    
    if (!isPasswordValid) {
      return null
    }
    
    // Return user object compatible with NextAuth
    return {
      id: user.id,
      email: user.email,
      name: user.name || user.email,
      role: user.role || 'USER',
    }
  } catch (error) {
    console.error('[Auth] Authentication error:', error)
    return null
  }
}

// Test function to verify database connection
export async function testDatabaseConnection() {
  try {
    const result = await queryDirect('SELECT NOW() as time')
    return { 
      success: true, 
      time: result.rows[0].time,
      message: 'Database connection successful'
    }
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message,
      message: 'Database connection failed'
    }
  }
}

// Function to create or update admin user
export async function ensureAdminUser() {
  try {
    const email = 'admin@akashic.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Check if user exists
    const checkResult = await queryDirect(
      'SELECT id FROM "User" WHERE email = $1',
      [email]
    )
    
    if (checkResult.rows.length > 0) {
      // Update existing user
      await queryDirect(
        'UPDATE "User" SET password = $1, role = $2, "emailVerified" = NOW() WHERE email = $3',
        [hashedPassword, 'ADMIN', email]
      )
      return { message: 'Admin user updated', email }
    } else {
      // Create new user
      await queryDirect(
        'INSERT INTO "User" (id, email, password, name, role, "emailVerified", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW(), NOW())',
        [email, hashedPassword, 'Admin User', 'ADMIN']
      )
      return { message: 'Admin user created', email }
    }
  } catch (error: any) {
    console.error('[Auth] Error ensuring admin user:', error)
    return { error: error.message }
  }
}