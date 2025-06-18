import Redis from 'ioredis'

interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null>
  del(key: string): Promise<number>
  ping(): Promise<string>
  isAvailable(): boolean
}

class OptionalRedis implements RedisLike {
  private client: Redis | null = null
  private isConnected = false
  private connectionAttempted = false
  private initPromise: Promise<void> | null = null

  constructor() {
    // Skip Redis initialization during build or if explicitly disabled
    if (process.env.SKIP_REDIS === 'true' || process.env.SKIP_ENV_VALIDATION === '1') {
      console.log('[Redis] Disabled by environment')
      return
    }

    // Only attempt connection if Redis URL is provided
    if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
      console.log('[Redis] No Redis configuration found. Running without cache.')
      return
    }

    this.initPromise = this.initialize()
  }

  private async initialize() {
    try {
      const config = process.env.REDIS_URL 
        ? process.env.REDIS_URL
        : {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            enableOfflineQueue: false,
            connectTimeout: 5000,
            lazyConnect: true,
            retryStrategy: (times: number) => {
              if (times > 3) {
                console.log('[Redis] Connection failed after 3 attempts')
                return null
              }
              return Math.min(times * 200, 1000)
            }
          }

      this.client = new Redis(config as any)

      this.client.on('error', (err) => {
        if (!this.connectionAttempted) {
          console.log('[Redis] Connection error:', err.message)
          this.connectionAttempted = true
        }
      })

      this.client.on('connect', () => {
        this.isConnected = true
        console.log('[Redis] Connected successfully')
      })

      this.client.on('close', () => {
        this.isConnected = false
        console.log('[Redis] Connection closed')
      })

      // Attempt connection with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        )
      ])
    } catch (error) {
      console.log('[Redis] Initialization failed:', error instanceof Error ? error.message : 'Unknown error')
      this.cleanup()
    }
  }

  private cleanup() {
    if (this.client) {
      this.client.disconnect()
      this.client = null
    }
    this.isConnected = false
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) return null
    try {
      return await this.client.get(key)
    } catch (error) {
      console.error('[Redis] Get error:', error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    if (!this.client || !this.isConnected) return null
    try {
      if (mode === 'EX' && duration) {
        return await this.client.set(key, value, 'EX', duration) as 'OK'
      }
      return await this.client.set(key, value) as 'OK'
    } catch (error) {
      console.error('[Redis] Set error:', error instanceof Error ? error.message : 'Unknown error')
      return null
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client || !this.isConnected) return 0
    try {
      return await this.client.del(key)
    } catch (error) {
      console.error('[Redis] Del error:', error instanceof Error ? error.message : 'Unknown error')
      return 0
    }
  }

  async ping(): Promise<string> {
    if (!this.client) throw new Error('Redis not available')
    if (!this.isConnected) throw new Error('Redis not connected')
    try {
      return await this.client.ping()
    } catch (error) {
      throw new Error('Redis ping failed')
    }
  }

  isAvailable(): boolean {
    return this.isConnected
  }
}

// Memory-based fallback cache for when Redis is not available
class MemoryCache implements RedisLike {
  private cache = new Map<string, { value: string; expires?: number }>()

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (item.expires && item.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    const expires = mode === 'EX' && duration ? Date.now() + (duration * 1000) : undefined
    this.cache.set(key, { value, expires })
    
    // Cleanup expired entries periodically
    if (this.cache.size > 1000) {
      const now = Date.now()
      for (const [k, v] of this.cache.entries()) {
        if (v.expires && v.expires < now) {
          this.cache.delete(k)
        }
      }
    }
    
    return 'OK'
  }

  async del(key: string): Promise<number> {
    return this.cache.delete(key) ? 1 : 0
  }

  async ping(): Promise<string> {
    return 'PONG'
  }

  isAvailable(): boolean {
    return true
  }
}

// Singleton instance
let redisInstance: RedisLike | null = null

// Export a proxy that lazily initializes Redis
export const redis: RedisLike = new Proxy({} as RedisLike, {
  get(target, prop) {
    // Initialize only when actually used
    if (!redisInstance && typeof window === 'undefined') {
      const optionalRedis = new OptionalRedis()
      
      // Use memory cache as fallback if Redis is not available
      redisInstance = optionalRedis.isAvailable() ? optionalRedis : new MemoryCache()
    }
    
    // Return the method from the instance
    return redisInstance ? (redisInstance as any)[prop] : () => null
  }
})

// Graceful shutdown
if (typeof window === 'undefined') {
  const handleShutdown = async () => {
    if (redisInstance && 'client' in redisInstance && (redisInstance as any).client) {
      console.log('[Redis] Disconnecting...')
      try {
        await (redisInstance as any).client.quit()
        console.log('[Redis] Disconnected')
      } catch (error) {
        console.error('[Redis] Disconnect error:', error)
      }
    }
  }

  process.on('beforeExit', handleShutdown)
  process.on('SIGINT', handleShutdown)
  process.on('SIGTERM', handleShutdown)
}