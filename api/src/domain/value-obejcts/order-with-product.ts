import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

interface OrderWithProductsProps {
  id: UniqueEntityId
  customerId: UniqueEntityId
  date: string
  total: number
  createdAt: Date
  updatedAt?: Date
  deletedAt?: Date | null
  orderProducts: {
    id: UniqueEntityId
    orderId: UniqueEntityId
    productId: UniqueEntityId
    value: number
    quantity: number
    createdAt: Date
    updatedAt?: Date
    deletedAt?: Date | null
  }[]
}

export class OrderWithProducts extends ValueObject<OrderWithProductsProps> {
  static create(props: OrderWithProductsProps) {
    return new OrderWithProducts(props)
  }

  get id() {
    return this.props.id
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

  get orderProducts() {
    return this.props.orderProducts
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
