import type { Optional } from '@/core/optional'

import { Entity } from '../../core/entities/entity'
import type { UniqueEntityId } from '../../core/entities/unique-entity-id'

export interface OrderProductProps {
  orderId: UniqueEntityId
  productId: UniqueEntityId
  value: number
  quantity: number
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export class OrderProduct extends Entity<OrderProductProps> {
  static create(
    props: Optional<OrderProductProps, 'createdAt' | 'quantity'>,
    id?: UniqueEntityId,
  ) {
    const order = new OrderProduct(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        quantity: props.quantity ?? 1,
      },
      id,
    )
    return order
  }

  get orderId() {
    return this.props.orderId
  }

  get productId() {
    return this.props.productId
  }

  get value() {
    return this.props.value
  }

  get quantity() {
    return this.props.quantity
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
