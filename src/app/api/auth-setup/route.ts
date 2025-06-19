import { NextRequest, NextResponse } from 'next/server'
import { testDatabaseConnection, ensureAdminUser } from '@/lib/auth-simple'

export async function GET() {
  try {
    // Test database connection
    const dbTest = await testDatabaseConnection()
    
    return NextResponse.json({
      database: dbTest,
      environment: {
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Setup check failed',
      message: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { setupKey } = await request.json()
    
    // Simple security check
    if (setupKey !== 'setup-akashic-2024') {
      return NextResponse.json({
        error: 'Invalid setup key'
      }, { status: 401 })
    }
    
    // Test connection first
    const dbTest = await testDatabaseConnection()
    if (!dbTest.success) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: dbTest
      }, { status: 500 })
    }
    
    // Ensure admin user exists
    const adminResult = await ensureAdminUser()
    
    return NextResponse.json({
      database: dbTest,
      admin: adminResult,
      credentials: {
        email: 'admin@akashic.com',
        password: 'Admin123!'
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Setup failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}