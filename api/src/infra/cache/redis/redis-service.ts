import Redis from 'ioredis'

import { env } from '@/config/env'

export class RedisService extends Redis {
  private static instance: RedisService | null = null
  private constructor() {
    super({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      db: env.REDIS_DB,
    })
  }

  static getInstance(): RedisService {
    if (!this.instance) {
      this.instance = new RedisService()
    }
    return this.instance
  }

  onModuleDestroy() {
    return this.disconnect()
  }
}
