import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderFile, type OrderFileProps } from '@/domain/entities/order-file'

export function makeOrderFile(
  override: Partial<OrderFileProps> = {},
  id?: UniqueEntityId,
) {
  const orderFile = OrderFile.create(
    {
      bucket: faker.image.avatar(),
      key: faker.image.avatar(),
      name: faker.image.avatar(),
      status: 'PROCESSING',
      url: faker.internet.url(),
      ...override,
    },
    id,
  )

  return orderFile
}
