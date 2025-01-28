import { faker } from '@faker-js/faker'
import dayjs from 'dayjs'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order, type OrderProps } from '@/domain/entities/order'

export function makeOrder(
  override: Partial<OrderProps> = {},
  id?: UniqueEntityId,
) {
  const order = Order.create(
    {
      customerId: new UniqueEntityId(),
      date: dayjs(faker.date.anytime()).format('YYYY-MM-DD'),
      ...override,
    },
    id,
  )

  return order
}
