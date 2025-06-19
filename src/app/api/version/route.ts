import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    version: '1.0.2',
    buildTime: new Date().toISOString(),
    commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    env: process.env.VERCEL_ENV || 'development',
    features: {
      auth: 'direct-db',
      ssl: 'disabled-for-supabase',
      prisma: 'with-ssl-fix',
      dashboard: 'with-error-handling'
    }
  })
}