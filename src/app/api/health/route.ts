import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { redis } from '@/lib/redis'

// Cache health check results to avoid excessive database queries
let lastHealthCheck: { timestamp: number; result: any } | null = null
const HEALTH_CHECK_CACHE_MS = 5000 // Cache for 5 seconds

export async function GET() {
  try {
    // Return cached result if recent enough
    if (lastHealthCheck && Date.now() - lastHealthCheck.timestamp < HEALTH_CHECK_CACHE_MS) {
      return NextResponse.json(lastHealthCheck.result)
    }

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown'
      }
    }

    // Check database using existing connection pool
    try {
      await prisma.$queryRaw`SELECT 1`
      healthStatus.services.database = 'healthy'
    } catch (error) {
      console.error('[Health] Database check failed:', error)
      healthStatus.services.database = 'unhealthy'
      healthStatus.status = 'degraded'
    }

    // Check Redis if available
    try {
      if (redis && redis.isAvailable()) {
        await redis.ping()
        healthStatus.services.redis = 'healthy'
      } else {
        healthStatus.services.redis = 'not configured'
      }
    } catch (error) {
      console.error('[Health] Redis check failed:', error)
      healthStatus.services.redis = 'unhealthy'
      // Don't degrade overall health for Redis issues since it's optional
    }

    // During startup, be more lenient
    const startupGracePeriod = 60000 // 60 seconds
    const uptime = process.uptime() * 1000 // Convert to milliseconds
    
    if (uptime < startupGracePeriod && healthStatus.status !== 'healthy') {
      console.log(`[Health] Grace period active (${Math.round(uptime / 1000)}s/${startupGracePeriod / 1000}s)`)
      healthStatus.status = 'starting'
      
      // Cache result
      lastHealthCheck = { timestamp: Date.now(), result: healthStatus }
      
      // Return 200 during startup to prevent container restarts
      return NextResponse.json(healthStatus, { status: 200 })
    }

    // Cache successful result
    if (healthStatus.status === 'healthy') {
      lastHealthCheck = { timestamp: Date.now(), result: healthStatus }
    }

    // Return appropriate status code
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503
    return NextResponse.json(healthStatus, { status: statusCode })
    
  } catch (error: any) {
    console.error('[Health] Unexpected error:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message || 'Unknown error'
    }, { status: 503 })
  }
}