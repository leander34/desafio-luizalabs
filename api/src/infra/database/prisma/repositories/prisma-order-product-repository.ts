import { Decimal } from '@prisma/client/runtime/library.js'

import type {
  FindByExtOrderIdAndExtProductIdAndValueParams,
  OrderProductRepository,
} from '@/application/repositories/order-product-repository'
import type { OrderProduct } from '@/domain/entities/order-product'
import type { CacheRepository } from '@/infra/cache/cache-repository'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaOrderProductMapper } from '../mappers/prisma-order-product-mapper'

export class PrismaOrderProductRepository implements OrderProductRepository {
  constructor(private cacheService: CacheRepository) {}

  async findByOrderIdAndExtProductIdAndValue({
    orderId,
    externalProductIdFromFile,
    value,
  }: FindByExtOrderIdAndExtProductIdAndValueParams): Promise<OrderProduct | null> {
    const prismaOrder = await prismaClient.orderProduct.findUnique({
      where: {
        externalProductIdFromFile_orderId_value: {
          externalProductIdFromFile,
          orderId,
          value: new Decimal(Number(value.toFixed(2))),
        },
      },
    })

    if (!prismaOrder) {
      return null
    }

    return PrismaOrderProductMapper.toDomain(prismaOrder)
  }

  async create(orderProduct: OrderProduct): Promise<void> {
    const orderProductConvertedToPrisma =
      PrismaOrderProductMapper.toPrisma(orderProduct)

    await prismaClient.orderProduct.create({
      data: orderProductConvertedToPrisma,
    })

    // await this.cacheService.deleteKeysByPattern(`order*`)
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
    // await this.cacheService.deleteKeysByPattern(`order*`)
  }
}
