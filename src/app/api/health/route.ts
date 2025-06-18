import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { redis } from '@/lib/redis'

export async function GET() {
  try {
    // Initialize Prisma with retry logic
    const prisma = new PrismaClient()
    
    // Try to connect with timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 15000)
    )
    
    try {
      await Promise.race([
        prisma.$connect(),
        timeoutPromise
      ])
      
      // Check database
      await prisma.$queryRaw`SELECT 1`
    } finally {
      await prisma.$disconnect()
    }
    
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
    // During startup, be more lenient with health checks
    const startupGracePeriod = 60000 // 60 seconds
    const uptime = process.uptime() * 1000 // Convert to milliseconds
    
    if (uptime < startupGracePeriod) {
      console.warn(`Health check warning during startup (${Math.round(uptime / 1000)}s):`, error.message)
      return NextResponse.json({
        status: 'starting',
        timestamp: new Date().toISOString(),
        uptime: Math.round(uptime / 1000),
        message: 'Service is starting up...',
        error: error.message
      }, { status: 200 }) // Return 200 during startup to prevent Railway from killing the service
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 })
  }
}