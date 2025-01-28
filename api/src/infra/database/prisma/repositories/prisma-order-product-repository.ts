import { Decimal } from '@prisma/client/runtime/library.js'

import type {
  FindByOrderIdAndProductIdAndValueParams,
  OrderProductRepository,
} from '@/application/repositories/order-product-repository'
import type { OrderProduct } from '@/domain/entities/order-product'
import type { CacheRepository } from '@/infra/cache/cache-repository'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaOrderProductMapper } from '../mappers/prisma-order-product-mapper'

export class PrismaOrderProductRepository implements OrderProductRepository {
  constructor(private cacheService: CacheRepository) {}
  async findByOrderIdAndProductIdAndValue({
    orderId,
    productId,
    value,
  }: FindByOrderIdAndProductIdAndValueParams): Promise<OrderProduct | null> {
    const prismaOrderProduct = await prismaClient.orderProduct.findUnique({
      where: {
        productId_orderId_value: {
          orderId,
          productId,
          value: new Decimal(Number(value.toFixed(2))),
        },
      },
    })

    if (!prismaOrderProduct) return null

    return PrismaOrderProductMapper.toDomain(prismaOrderProduct)
  }

  async create(orderProduct: OrderProduct): Promise<void> {
    const orderProductConvertedToPrisma =
      PrismaOrderProductMapper.toPrisma(orderProduct)

    await prismaClient.orderProduct.create({
      data: orderProductConvertedToPrisma,
    })

    // await this.cacheService.delete(`order:${orderProduct.orderId}`)
    // await this.cacheService.deleteKeysByPattern(
    //   `order:${orderProduct.orderId.toValue()}*`,
    // )
    await this.cacheService.deleteKeysByPattern(`order*`)
  }

  async increaseQuantity(orderProduct: OrderProduct): Promise<void> {
    await prismaClient.orderProduct.update({
      where: {
        id: orderProduct.id.toValue(),
      },
      data: {
        quantity: orderProduct.quantity,
      },
    })
    // await this.cacheService.delete(`order:${prismaOrderProduct.orderId}`)
    // await this.cacheService.deleteKeysByPattern(
    //   `order:${prismaOrderProduct.orderId}*`,
    // )
    await this.cacheService.deleteKeysByPattern(`order*`)
  }
}
