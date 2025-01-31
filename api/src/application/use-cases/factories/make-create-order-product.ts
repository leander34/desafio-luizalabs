import { RedisCacheRepository } from '@/infra/cache/redis/redis-cache-repository'
import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'
import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'
import { PrismaOrderProductRepository } from '@/infra/database/prisma/repositories/prisma-order-product-repository'
import { PrismaOrderRepository } from '@/infra/database/prisma/repositories/prisma-order-repository'

import { CreateOrderProductUseCase } from '../orders/create-order-product'

export function makeCreateOrderProductUseCase() {
  const cacheRepository = new RedisCacheRepository()
  const orderRepository = new PrismaOrderRepository(cacheRepository)
  const orderProductRepository = new PrismaOrderProductRepository(
    cacheRepository,
  )
  const orderFileRepository = new PrismaOrderFileRepository()
  const customerRepository = new PrismaCustomerRepository()
  const useCase = new CreateOrderProductUseCase(
    orderRepository,
    orderFileRepository,
    customerRepository,
    orderProductRepository,
  )
  return useCase
}
