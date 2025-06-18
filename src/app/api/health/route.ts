import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis if available
    let redisStatus = 'not configured'
    if (redis) {
      await redis.ping()
      redisStatus = 'healthy'
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy',
        redis: redisStatus
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  }
}