import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  OrderProduct,
  type OrderProductProps,
} from '@/domain/entities/order-product'

export function makeOrderProduct(
  override: Partial<OrderProductProps> = {},
  id?: UniqueEntityId,
) {
  const orderProduct = OrderProduct.create(
    {
      orderId: new UniqueEntityId(),
      productId: new UniqueEntityId(),
      value: Number(faker.commerce.price({ min: 1, max: 10000 })),
      ...override,
    },
    id,
  )

  return orderProduct
}
