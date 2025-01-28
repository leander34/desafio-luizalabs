import { Order, OrderProduct } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'

type OrderProductUpdated = Array<
  Omit<OrderProduct, 'value'> & {
    value: number
  }
>
type OrderWithProductsPrisma = Order & {
  total: number
  orderProducts: OrderProductUpdated
}
export class PrismaOrderWithProductsMapper {
  static toDomain(
    orderWithProductsPrisma: OrderWithProductsPrisma,
  ): OrderWithProducts {
    return OrderWithProducts.create({
      id: new UniqueEntityId(orderWithProductsPrisma.id),
      date: orderWithProductsPrisma.date,
      total: orderWithProductsPrisma.total,
      customerId: new UniqueEntityId(orderWithProductsPrisma.customerId),
      orderProducts: orderWithProductsPrisma.orderProducts.map((item) => ({
        id: new UniqueEntityId(item.id),
        orderId: new UniqueEntityId(item.orderId),
        productId: new UniqueEntityId(item.productId),
        quantity: item.quantity,
        value: item.value,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        deletedAt: item.deletedAt,
      })),
      createdAt: orderWithProductsPrisma.createdAt,
      updatedAt: orderWithProductsPrisma.updatedAt,
      deletedAt: orderWithProductsPrisma.deletedAt,
    })
  }
}
