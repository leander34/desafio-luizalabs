import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository'
import { PrismaOrderRepository } from '@/infra/database/prisma/repositories/prisma-order-repository'

import { GetOrderUseCase } from '../orders/get-order'

export function makeGetOrderUseCase() {
  const cacheRepository = new RedisCacheRepository()
  const orderRepository = new PrismaOrderRepository(cacheRepository)
  const useCase = new GetOrderUseCase(orderRepository)
  return useCase
}
