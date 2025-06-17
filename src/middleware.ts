import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting configuration
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetTime < now) {
      rateLimitMap.delete(key)
    }
  }
}, 5 * 60 * 1000)

function rateLimit(identifier: string, limit: number = 100, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)

  if (!record || record.resetTime < now) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= limit) {
    return false
  }

  record.count++
  return true
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add security headers
  const headers = new Headers(request.headers)
  headers.set('X-Frame-Options', 'DENY')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-XSS-Protection', '1; mode=block')
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next({ headers })
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Get client identifier (IP address or user ID)
    const token = await getToken({ req: request })
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
    const identifier = token?.sub || ip

    // Different rate limits for different endpoints
    let limit = 100 // Default: 100 requests per 15 minutes
    let windowMs = 15 * 60 * 1000

    if (pathname.startsWith('/api/auth/')) {
      limit = 10 // Auth endpoints: 10 attempts per 15 minutes
    } else if (pathname.startsWith('/api/ai/')) {
      limit = 20 // AI endpoints: 20 requests per 15 minutes
    } else if (pathname.startsWith('/api/messages/bulk')) {
      limit = 10 // Bulk operations: 10 per 15 minutes
    }

    if (!rateLimit(identifier, limit, windowMs)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '900', // 15 minutes in seconds
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
        },
      })
    }
  }

  // CSRF Protection for mutation endpoints
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    const token = await getToken({ req: request })
    
    // Require authentication for all non-GET API requests
    if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !token) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/campaigns', '/messages', '/approvals', '/settings']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    const token = await getToken({ req: request })

    if (!token) {
      const signInUrl = new URL('/login', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next({ headers })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}