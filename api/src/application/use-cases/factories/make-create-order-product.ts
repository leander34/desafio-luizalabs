import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository'
import { PrismaOrderProductRepository } from '@/infra/database/prisma/repositories/prisma-order-product-repository'
import { PrismaOrderRepository } from '@/infra/database/prisma/repositories/prisma-order-repository'

import { CreateOrderProductUseCase } from '../orders/create-order-product'

export function makeCreateOrderProductUseCase() {
  const cacheRepository = new RedisCacheRepository()
  const orderRepository = new PrismaOrderRepository(cacheRepository)
  const orderProductRepository = new PrismaOrderProductRepository(
    cacheRepository,
  )
  const useCase = new CreateOrderProductUseCase(
    orderRepository,
    orderProductRepository,
  )
  return useCase
}
