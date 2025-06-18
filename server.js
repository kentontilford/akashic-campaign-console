const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0' // Listen on all interfaces
const port = process.env.PORT || 3000

console.log('=== SERVER STARTUP ===')
console.log('Environment:', process.env.NODE_ENV)
console.log('Port:', port)
console.log('Database URL exists:', !!process.env.DATABASE_URL)
console.log('Redis URL exists:', !!process.env.REDIS_URL)
console.log('NextAuth Secret exists:', !!process.env.NEXTAUTH_SECRET)
console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      
      // Log health check requests
      if (parsedUrl.pathname === '/api/health') {
        console.log('Health check request received')
      }
      
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log('> Server is listening for connections')
    
    // Test that we can actually bind to the port
    setTimeout(() => {
      console.log('> Server still running after 5 seconds')
    }, 5000)
  })
})