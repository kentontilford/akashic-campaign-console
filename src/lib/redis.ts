import Redis from 'ioredis'

class OptionalRedis {
  private client: Redis | null = null
  private isConnected = false
  private connectionAttempted = false

  constructor() {
    if (process.env.SKIP_REDIS === 'true') {
      console.log('Redis disabled by SKIP_REDIS environment variable')
      return
    }

    try {
      if (process.env.REDIS_URL) {
        this.client = new Redis(process.env.REDIS_URL)
      } else {
        this.client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD,
          retryStrategy: (times) => {
            if (times > 3) {
              console.log('Redis connection failed after 3 attempts. Running without cache.')
              return null
            }
            return Math.min(times * 200, 1000)
          },
          enableOfflineQueue: false,
          lazyConnect: true
        })
      }

      this.client.on('error', (err) => {
        if (!this.connectionAttempted) {
          console.log('Redis not available. Running without cache.')
          this.connectionAttempted = true
        }
      })

      this.client.on('connect', () => {
        this.isConnected = true
        console.log('Redis Client Connected')
      })

      // Attempt connection
      this.client.connect().catch(() => {
        console.log('Redis connection failed. Running without cache.')
      })
    } catch (error) {
      console.log('Redis initialization failed. Running without cache.')
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) return null
    try {
      return await this.client.get(key)
    } catch {
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
    } catch {
      return null
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client || !this.isConnected) return 0
    try {
      return await this.client.del(key)
    } catch {
      return 0
    }
  }

  async ping(): Promise<string> {
    if (!this.client) throw new Error('Redis not initialized')
    return await this.client.ping()
  }
}

// Only initialize Redis in runtime, not during build
let redisInstance: OptionalRedis | null = null

export const redis = new Proxy({} as OptionalRedis, {
  get(target, prop) {
    if (!redisInstance && typeof window === 'undefined' && process.env.SKIP_ENV_VALIDATION !== '1') {
      redisInstance = new OptionalRedis()
    }
    return redisInstance ? (redisInstance as any)[prop] : () => null
  }
})