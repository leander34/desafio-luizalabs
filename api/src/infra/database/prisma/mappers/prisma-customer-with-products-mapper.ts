// import { type Customer, Order, OrderProduct } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'

// type CustomerOmitted = Omit<Customer, 'deletedAt' | 'updatedAt' | 'createdAt'>
// type OrderOmitted = Omit<
//   Order,
//   'deletedAt' | 'updatedAt' | 'createdAt' | 'customerId'
// >
// type OrderProductOmitted = Omit<
//   OrderProduct,
//   | 'deletedAt'
//   | 'updatedAt'
//   | 'createdAt'
//   | 'customerId'
//   | 'id'
//   | 'orderId'
//   | 'value'
// > & {
//   value: number
// }
// type OrderCombineted = OrderOmitted & {
//   total: number
//   orderProducts: OrderProductOmitted[]
// }
// export type CustomerWithProductsPrisma = CustomerOmitted & {
//   orders: OrderCombineted[]
// }

type PrismaCustomerWithProducts = {
  externalCustomerIdFromFile: number
  name: string
  orders: {
    externalOrderIdFromFile: number
    date: string
    total: number
    orderProducts: {
      externalProductIdFromFile: number
      value: number
      quantity: number
    }[]
  }[]
}
export class PrismaCustomerWithProductsMapper {
  static toDomain(
    prismaCustomerWithProducts: PrismaCustomerWithProducts,
  ): CustomerWithOrdersAndProducts {
    return CustomerWithOrdersAndProducts.create({
      externalCustomerIdFromFile: new UniqueEntityId(
        prismaCustomerWithProducts.externalCustomerIdFromFile,
      ),
      name: prismaCustomerWithProducts.name,
      orders: prismaCustomerWithProducts.orders.map((order) => ({
        externalOrderIdFromFile: new UniqueEntityId(
          order.externalOrderIdFromFile,
        ),
        date: order.date,
        total: order.total,
        orderProducts: order.orderProducts.map((item) => ({
          externalProductIdFromFile: new UniqueEntityId(
            item.externalProductIdFromFile,
          ),
          value: item.value,
          quantity: item.quantity,
        })),
      })),
    })
  }
}
