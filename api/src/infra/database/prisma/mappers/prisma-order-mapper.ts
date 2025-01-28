import { Order as PrismaOrder, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/entities/order'
export class PrismaOrderMapper {
  static toDomain(prismaOrder: PrismaOrder & { total: number }): Order {
    return Order.create(
      {
        customerId: new UniqueEntityId(prismaOrder.customerId),
        date: prismaOrder.date,
        total: prismaOrder.total,
        createdAt: prismaOrder.createdAt,
        updatedAt: prismaOrder.updatedAt,
        deletedAt: prismaOrder.deletedAt,
      },
      new UniqueEntityId(prismaOrder.id),
    )
  }

  static toPrisma(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toDBValue(),
      customerId: order.customerId.toValue(),
      date: order.date,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deletedAt: order.deletedAt,
    }
  }
}
