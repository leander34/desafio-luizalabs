import { OrderProduct as PrismaOrderProduct, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderProduct } from '@/domain/entities/order-product'
export class PrismaOrderProductMapper {
  static toDomain(prismaOrderProduct: PrismaOrderProduct): OrderProduct {
    return OrderProduct.create(
      {
        orderId: new UniqueEntityId(prismaOrderProduct.orderId),
        externalProductIdFromFile: new UniqueEntityId(
          prismaOrderProduct.externalProductIdFromFile,
        ),
        quantity: prismaOrderProduct.quantity,
        value: prismaOrderProduct.value.toNumber(),
        createdAt: prismaOrderProduct.createdAt,
        deletedAt: prismaOrderProduct.deletedAt,
        updatedAt: prismaOrderProduct.updatedAt,
      },
      new UniqueEntityId(prismaOrderProduct.id),
    )
  }

  static toPrisma(
    orderProduct: OrderProduct,
  ): Prisma.OrderProductUncheckedCreateInput {
    return {
      id: orderProduct.id.toDBValue(),
      orderId: orderProduct.orderId.toValue(),
      externalProductIdFromFile:
        orderProduct.externalProductIdFromFile.toValue(),
      quantity: orderProduct.quantity,
      value: orderProduct.value,
      createdAt: orderProduct.createdAt,
      updatedAt: orderProduct.updatedAt,
      deletedAt: orderProduct.deletedAt,
    }
  }
}
