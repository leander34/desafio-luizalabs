import { faker } from '@faker-js/faker'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer, type CustomerProps } from '@/domain/entities/customer'

export function makeCustomer(
  override: Partial<CustomerProps> = {},
  id?: UniqueEntityId,
) {
  const customer = Customer.create(
    {
      name: faker.person.fullName(),
      externalCustomerIdFromFile: new UniqueEntityId(),
      orderFileId: new UniqueEntityId(),
      ...override,
    },
    id,
  )

  return customer
}
