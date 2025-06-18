import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Ultra-simple health check with no dependencies or environment checks
  // This endpoint should ALWAYS return 200 OK if the service is running
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime())
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}