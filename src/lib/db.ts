import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const createPrismaClient = () => {
  // For production, prefer DIRECT_URL to avoid pooler issues
  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL || ''
  
  if (!databaseUrl) {
    throw new Error('Database URL not configured')
  }
  
  const client = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Add connection retry logic
  client.$connect = new Proxy(client.$connect, {
    apply: async (target, thisArg, args) => {
      let lastError: Error | undefined
      const maxRetries = 3
      const retryDelay = 1000 // 1 second

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`[Prisma] Connection attempt ${attempt}/${maxRetries}`)
          await target.apply(thisArg, args as [])
          console.log('[Prisma] Connected successfully')
          return
        } catch (error) {
          lastError = error as Error
          console.error(`[Prisma] Connection attempt ${attempt} failed:`, error)
          
          if (attempt < maxRetries) {
            console.log(`[Prisma] Retrying in ${retryDelay}ms...`)
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          }
        }
      }

      console.error('[Prisma] All connection attempts failed')
      throw lastError
    }
  })

  return client
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown
const handleShutdown = async () => {
  console.log('[Prisma] Disconnecting...')
  await prisma.$disconnect()
  console.log('[Prisma] Disconnected')
}

process.on('beforeExit', handleShutdown)
process.on('SIGINT', handleShutdown)
process.on('SIGTERM', handleShutdown)