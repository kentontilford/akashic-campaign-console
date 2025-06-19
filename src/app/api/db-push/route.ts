import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Get push key from request
    const { pushKey } = await request.json()
    
    // Verify push key
    const validPushKey = process.env.DB_PUSH_KEY || 'akashic-push-2024'
    
    if (pushKey !== validPushKey) {
      return NextResponse.json(
        { error: 'Invalid push key' },
        { status: 401 }
      )
    }
    
    // For Vercel, we'll use a different approach
    // We'll create the tables by running a simple query that forces Prisma to create them
    
    // First, let's check what tables exist
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    ` as any[]
    
    const tableNames = tables.map((t: any) => t.tablename)
    
    return NextResponse.json({
      message: 'Database check complete',
      existingTables: tableNames,
      instruction: 'Run "npm run prisma:push" locally with DATABASE_URL from Vercel to create tables'
    })
    
  } catch (error: any) {
    console.error('DB push error:', error)
    
    // If the error is about missing tables, provide instructions
    if (error.message.includes('does not exist')) {
      return NextResponse.json({
        error: 'Database tables do not exist',
        solution: 'You need to run database migrations',
        steps: [
          '1. Copy DATABASE_URL from Vercel environment variables',
          '2. Run locally: DATABASE_URL="your-url" npm run prisma:push',
          '3. Or use Vercel CLI: vercel env pull && npm run prisma:push'
        ]
      }, { status: 500 })
    }
    
    return NextResponse.json(
      { 
        error: 'Database operation failed',
        message: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}