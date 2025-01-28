import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository'
import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'
import { PrismaOrderRepository } from '@/infra/database/prisma/repositories/prisma-order-repository'

import { CreateOrderUseCase } from '../orders/create-order'

export function makeCreateOrderUseCase() {
  const cacheRepository = new RedisCacheRepository()
  const orderRepository = new PrismaOrderRepository(cacheRepository)
  const customerRepository = new PrismaCustomerRepository()
  const useCase = new CreateOrderUseCase(orderRepository, customerRepository)
  return useCase
}
