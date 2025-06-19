import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test basic database connectivity
    const dbTest = await prisma.$queryRaw`SELECT NOW() as time`
    
    // Test user count
    const userCount = await prisma.user.count().catch(err => ({
      error: err.message,
      code: err.code
    }))
    
    // Test if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { email: 'admin@akashic.com' },
      select: { id: true, email: true, role: true }
    }).catch(err => ({
      error: err.message,
      code: err.code
    }))
    
    return NextResponse.json({
      status: 'debug',
      database: {
        connected: true,
        time: dbTest
      },
      userCount,
      adminUser: adminExists,
      environment: {
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}