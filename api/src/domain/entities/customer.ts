import type { Optional } from '@/core/optional'

import { Entity } from '../../core/entities/entity'
import type { UniqueEntityId } from '../../core/entities/unique-entity-id'

export interface CustomerProps {
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export class Customer extends Entity<CustomerProps> {
  static create(
    props: Optional<CustomerProps, 'createdAt' | 'updatedAt'>,
    id?: UniqueEntityId,
  ) {
    const order = new Customer(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        updatedAt: props.updatedAt ?? new Date(),
      },
      id,
    )
    return order
  }

  get name() {
    return this.props.name
  }

  get createdAt() {
    return this.props.createdAt
  }

  get updatedAt() {
    return this.props.updatedAt
  }

  get deletedAt() {
    return this.props.deletedAt
  }
}
