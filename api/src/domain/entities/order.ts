import type { Optional } from '@/core/optional'

import { Entity } from '../../core/entities/entity'
import type { UniqueEntityId } from '../../core/entities/unique-entity-id'

export interface OrderProps {
  date: string
  customerId: UniqueEntityId
  total: number
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  static create(
    props: Optional<OrderProps, 'createdAt' | 'total'>,
    id?: UniqueEntityId,
  ) {
    const order = new Order(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        total: props.total ?? 0,
      },
      id,
    )
    return order
  }

  get customerId() {
    return this.props.customerId
  }

  get date() {
    return this.props.date
  }

  get total() {
    return this.props.total
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
