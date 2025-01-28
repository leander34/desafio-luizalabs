import type {
  FindManyWithProductsParams,
  OrderRepository,
} from '@/application/repositories/order-repository'
import type { PaginationParams } from '@/core/pagination'
import type { Order } from '@/domain/entities/order'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'
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
    if (!prismaOrder) return null
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
    const cacheKey = `order:${id}`
    const cachedOrder = await this.cacheService.get(cacheKey)

    if (cachedOrder) {
      console.log('cache', 'findUniqueWithProducts')
      return PrismaOrderWithProductsMapper.toDomain(JSON.parse(cachedOrder))
    }

    const orderById = await prismaClient.order.findUnique({
      where: {
        id,
      },
      include: {
        orderProducts: true,
      },
    })

    if (!orderById) return null

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

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(orderWithCombinedData),
      60 * 60 * 2, // Duas horas
    )

    return PrismaOrderWithProductsMapper.toDomain(orderWithCombinedData)
  }

  async findManyWithProducts(
    params: FindManyWithProductsParams,
    pagination: PaginationParams,
  ): Promise<OrderWithProducts[]> {
    const page = pagination.page ? Number(pagination.page) : null
    const size = pagination.size ? Number(pagination.size) : null
    const orders = await prismaClient.order.findMany({
      take: page || size ? (size ?? 100) : undefined,
      skip: page || size ? ((page ?? 1) - 1) * (size ?? 100) : undefined,
      where: {
        date: {
          gte: params.startDate ?? undefined,
          lte: params.endDate ?? undefined,
        },
        id: params.orderId ? Number(params.orderId) : undefined,
        customer:
          params.name || params.customerId
            ? {
                id: params.customerId ? Number(params.customerId) : undefined,
                name: params.name
                  ? {
                      contains: params.name,
                    }
                  : undefined,
              }
            : undefined,
      },
      include: {
        orderProducts: true,
      },
    })

    const cacheKey = `order:cond:blabla`
    const cachedOrder = await this.cacheService.get(cacheKey)

    // if (cachedOrder) {
    //   console.log('cache', 'findManyWithProducts')

    //   const ordersWithCombinedData = JSON.parse(cachedOrder)
    //   return ordersWithCombinedData.map(PrismaOrderWithProductsMapper.toDomain)
    // }

    const ordersWithCombinedData = await Promise.all(
      orders.map(async (order) => {
        // const cacheKey = `order:cod:${order.id}`
        // const cachedOrder = await this.cacheService.get(cacheKey)

        // if (cachedOrder) {
        //   return JSON.parse(cachedOrder)
        // }

        const total = order.orderProducts.reduce((total, product) => {
          return Number(
            (total + product.value.toNumber() * product.quantity).toFixed(2),
          )
        }, 0)

        const orderWithCombinedData = {
          ...order,
          orderProducts: order.orderProducts.map((item) => ({
            ...item,
            value: item.value.toNumber(),
          })),
          total,
        }

        // Salva no cache individualmente (com TTL de 2 hora)
        // await this.cacheService.set(
        //   cacheKey,
        //   JSON.stringify(orderWithCombinedData),
        //   60 * 60 * 2, // duas horas
        // )

        return orderWithCombinedData
      }),
    )

    await this.cacheService.set(
      cacheKey,
      JSON.stringify(ordersWithCombinedData),
      60 * 60 * 2, // Duas horas
    )

    return ordersWithCombinedData.map(PrismaOrderWithProductsMapper.toDomain)
  }

  async create(order: Order): Promise<any> {
    const orderConvertedToPrisma = PrismaOrderMapper.toPrisma(order)

    await prismaClient.order.create({
      data: orderConvertedToPrisma,
    })
  }
}
