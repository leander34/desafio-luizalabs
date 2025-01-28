import type Redis from 'ioredis'

import { CacheRepository } from '../cache-repository'
import { RedisService } from './redis-service'

export class RedisCacheRepository extends CacheRepository {
  private redis: Redis = RedisService.getInstance()

  async set(key: string, value: string, seconds = 3600): Promise<void> {
    await this.redis.set(key, value, 'EX', seconds)
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key)
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key)
  }

  async deleteKeysByPattern(pattern: string): Promise<void> {
    let cursor = '0'
    do {
      const [newCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      )
      cursor = newCursor

      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } while (cursor !== '0')
  }
}
