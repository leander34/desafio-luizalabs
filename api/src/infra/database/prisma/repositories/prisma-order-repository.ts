import type { OrderRepository } from '@/application/repositories/order-repository'
import type { Order } from '@/domain/entities/order'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-products'
import type { CacheRepository } from '@/infra/cache/cache-repository'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaOrderMapper } from '../mappers/prisma-order-mapper'
import { PrismaOrderWithProductsMapper } from '../mappers/prisma-order-with-products-mapper'
export class PrismaOrderRepository implements OrderRepository {
  constructor(private cacheService: CacheRepository) {}

  async findById(id: number): Promise<Order | null> {
    const prismaOrder = await prismaClient.order.findUnique({
      where: {
        id,
      },
      include: {
        orderProducts: true,
      },
    })
    if (!prismaOrder) {
      return null
    }
    const orderTotalValue = prismaOrder.orderProducts.reduce(
      (total, product) => {
        return Number(
          (total + product.value.toNumber() * product.quantity).toFixed(2),
        )
      },
      0,
    )
    return PrismaOrderMapper.toDomain({
      ...prismaOrder,
      total: orderTotalValue,
    })
  }

  async findUniqueWithProducts(id: number): Promise<OrderWithProducts | null> {
    const orderById = await prismaClient.order.findUnique({
      where: {
        id,
      },
      include: {
        orderProducts: true,
      },
    })

    if (!orderById) {
      return null
    }

    const orderTotalValue = orderById.orderProducts.reduce((total, product) => {
      return Number(
        (total + product.value.toNumber() * product.quantity).toFixed(2),
      )
    }, 0)

    const orderWithCombinedData = {
      ...orderById,
      orderProducts: orderById.orderProducts.map((item) => ({
        ...item,
        value: item.value.toNumber(),
      })),
      total: orderTotalValue,
    }

    return PrismaOrderWithProductsMapper.toDomain(orderWithCombinedData)
  }

  async create(order: Order): Promise<any> {
    const orderConvertedToPrisma = PrismaOrderMapper.toPrisma(order)

    await prismaClient.order.create({
      data: orderConvertedToPrisma,
    })
  }
}
