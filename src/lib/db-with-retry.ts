import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

// Create Prisma client with connection retry logic
async function createPrismaClient(): Promise<PrismaClient> {
  const client = globalThis.prisma ?? prismaClientSingleton()
  
  // Test connection with retries
  const maxRetries = 5
  const retryDelay = 2000 // Start with 2 seconds
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.$connect()
      console.log('Database connected successfully')
      break
    } catch (error) {
      console.error(`Database connection attempt ${i + 1} failed:`, error)
      
      if (i === maxRetries - 1) {
        throw new Error(`Failed to connect to database after ${maxRetries} attempts`)
      }
      
      // Exponential backoff
      const delay = retryDelay * Math.pow(2, i)
      console.log(`Retrying in ${delay / 1000} seconds...`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = client
  }
  
  return client
}

// Export a promise that resolves to the Prisma client
export const prismaPromise = createPrismaClient()

// For backward compatibility, export a synchronous version
// Note: This will throw if accessed before the connection is established
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    throw new Error('Database client not ready. Use prismaPromise.then() or await prismaPromise')
  }
})