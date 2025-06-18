import { NextResponse } from 'next/server'

export async function GET() {
  // Simple health check with no external dependencies
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT || '3000',
      hasDatabase: !!process.env.DATABASE_URL,
      hasRedis: !!process.env.REDIS_URL,
      hasAuth: !!process.env.NEXTAUTH_SECRET
    }
  })
}