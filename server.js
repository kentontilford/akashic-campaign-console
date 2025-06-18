const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Listen on all interfaces
const port = parseInt(process.env.PORT || '3000', 10)

// Server startup logging
console.log('[Server] Starting...')
console.log('[Server] Environment:', process.env.NODE_ENV || 'development')
console.log('[Server] Port:', port)
console.log('[Server] Hostname:', hostname)

// Log environment status (without exposing sensitive values)
const envStatus = {
  database: !!process.env.DATABASE_URL,
  redis: !!process.env.REDIS_URL || !!process.env.REDIS_HOST,
  auth: !!process.env.NEXTAUTH_SECRET,
  openai: !!process.env.OPENAI_API_KEY,
  skipRedis: process.env.SKIP_REDIS === 'true',
  skipEnvValidation: process.env.SKIP_ENV_VALIDATION === '1'
}
console.log('[Server] Environment status:', envStatus)

// Initialize Next.js app
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Graceful shutdown handling
let server
const gracefulShutdown = async (signal) => {
  console.log(`[Server] Received ${signal}, starting graceful shutdown...`)
  
  if (server) {
    // Stop accepting new connections
    server.close(async () => {
      console.log('[Server] HTTP server closed')
      
      try {
        // Close Next.js app
        await app.close()
        console.log('[Server] Next.js app closed')
      } catch (error) {
        console.error('[Server] Error closing Next.js app:', error)
      }
      
      // Exit process
      process.exit(0)
    })
    
    // Force exit after 30 seconds
    setTimeout(() => {
      console.error('[Server] Forcefully shutting down after timeout')
      process.exit(1)
    }, 30000)
  }
}

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Unhandled error handlers
process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit on unhandled promise rejections in production
  if (dev) {
    gracefulShutdown('unhandledRejection')
  }
})

// Prepare and start the server
app.prepare()
  .then(() => {
    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true)
        const { pathname } = parsedUrl
        
        // Log specific request types in development
        if (dev && (pathname === '/api/health' || pathname === '/api/health-simple')) {
          console.log(`[Server] Health check: ${pathname}`)
        }
        
        await handle(req, res, parsedUrl)
      } catch (err) {
        console.error('[Server] Request handler error:', err)
        
        // Send appropriate error response
        if (!res.headersSent) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'text/plain')
          res.end('Internal Server Error')
        }
      }
    })
    
    // Error handling for server
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Port ${port} is already in use`)
        process.exit(1)
      } else {
        console.error('[Server] Server error:', error)
        throw error
      }
    })
    
    // Start listening
    server.listen(port, hostname, () => {
      console.log(`[Server] Ready on http://${hostname}:${port}`)
      console.log('[Server] Accepting connections')
      
      // Verify server is responsive
      if (dev) {
        setTimeout(() => {
          console.log('[Server] Development server running normally')
        }, 5000)
      }
    })
  })
  .catch((error) => {
    console.error('[Server] Failed to start:', error)
    process.exit(1)
  })