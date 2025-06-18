import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Rate limiting configuration
const RATE_LIMITING_ENABLED = process.env.DISABLE_RATE_LIMITING !== 'true'
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Periodic cleanup of expired rate limit entries
if (RATE_LIMITING_ENABLED && typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

function rateLimit(identifier: string, limit: number = 100, windowMs: number = 15 * 60 * 1000): boolean {
  if (!RATE_LIMITING_ENABLED) {
    return true // Always allow if rate limiting is disabled
  }

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

  // Skip middleware for health check endpoints
  if (pathname === '/api/health' || pathname === '/api/health-simple') {
    return NextResponse.next()
  }

  // Add security headers
  const responseHeaders = new Headers()
  responseHeaders.set('X-Frame-Options', 'DENY')
  responseHeaders.set('X-Content-Type-Options', 'nosniff')
  responseHeaders.set('X-XSS-Protection', '1; mode=block')
  responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  if (process.env.NODE_ENV === 'production') {
    responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  // Skip static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next({
      headers: responseHeaders
    })
  }

  // Rate limiting for API routes (if enabled)
  if (RATE_LIMITING_ENABLED && pathname.startsWith('/api/')) {
    try {
      // Get client identifier (IP address or user ID)
      const token = await getToken({ req: request }).catch(() => null)
      const forwarded = request.headers.get('x-forwarded-for')
      const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'
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
            ...Object.fromEntries(responseHeaders.entries())
          },
        })
      }
    } catch (error) {
      console.error('[Middleware] Rate limiting error:', error)
      // Continue without rate limiting on error
    }
  }

  // CSRF Protection for mutation endpoints
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      const token = await getToken({ req: request }).catch(() => null)
      
      // Require authentication for all non-GET API requests (except auth endpoints)
      if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/') && !token) {
        return new NextResponse('Unauthorized', { 
          status: 401,
          headers: responseHeaders
        })
      }
    } catch (error) {
      console.error('[Middleware] CSRF protection error:', error)
      // Continue without CSRF protection on error
    }
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/campaigns', '/messages', '/approvals', '/settings']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    try {
      const token = await getToken({ req: request }).catch(() => null)

      if (!token) {
        const signInUrl = new URL('/login', request.url)
        signInUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(signInUrl, {
          headers: responseHeaders
        })
      }
    } catch (error) {
      console.error('[Middleware] Auth check error:', error)
      // Redirect to login on error for safety
      const signInUrl = new URL('/login', request.url)
      return NextResponse.redirect(signInUrl, {
        headers: responseHeaders
      })
    }
  }

  return NextResponse.next({
    headers: responseHeaders
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files) 
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}