import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test connection
    await prisma.$connect()
    
    // Count users
    const userCount = await prisma.user.count()
    
    // Get admin user (without password)
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@akashic.com' },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      status: 'connected',
      userCount,
      adminUser,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      code: error.code,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    }, { status: 500 })
  }
}