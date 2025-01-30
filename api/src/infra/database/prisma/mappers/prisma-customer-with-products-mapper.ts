import { type Customer, Order, OrderProduct } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'

type CustomerOmitted = Omit<Customer, 'deletedAt' | 'updatedAt' | 'createdAt'>
type OrderOmitted = Omit<
  Order,
  'deletedAt' | 'updatedAt' | 'createdAt' | 'customerId'
>
type OrderProductOmitted = Omit<
  OrderProduct,
  | 'deletedAt'
  | 'updatedAt'
  | 'createdAt'
  | 'customerId'
  | 'id'
  | 'orderId'
  | 'value'
> & {
  value: number
}
type OrderCombineted = OrderOmitted & {
  total: number
  products: OrderProductOmitted[]
}
export type CustomerWithProductsPrisma = CustomerOmitted & {
  orders: OrderCombineted[]
}
export class PrismaCustomerWithProductsMapper {
  static toDomain(
    prismaCustomerWithProducts: CustomerWithProductsPrisma,
  ): CustomerWithOrdersAndProducts {
    return CustomerWithOrdersAndProducts.create({
      id: new UniqueEntityId(prismaCustomerWithProducts.id),
      name: prismaCustomerWithProducts.name,
      orders: prismaCustomerWithProducts.orders.map((order) => ({
        id: new UniqueEntityId(order.id),
        date: order.date,
        total: order.total,
        orderProducts: order.products.map((item) => ({
          productId: new UniqueEntityId(item.productId),
          value: item.value,
          quantity: item.quantity,
        })),
      })),
    })
  }
}
