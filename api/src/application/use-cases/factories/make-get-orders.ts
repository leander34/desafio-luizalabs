import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository'
import { PrismaOrderRepository } from '@/infra/database/prisma/repositories/prisma-order-repository'

import { GetOrdersUseCase } from '../orders/get-orders'

export function makeGetOrdersUseCase() {
  const cacheRepository = new RedisCacheRepository()
  const orderRepository = new PrismaOrderRepository(cacheRepository)
  const useCase = new GetOrdersUseCase(orderRepository)
  return useCase
}
