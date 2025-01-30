import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

interface CustomerWithOrdersAndProductsProps {
  id: UniqueEntityId
  name: string
  orders: {
    id: UniqueEntityId
    date: string
    total: number

    orderProducts: {
      productId: UniqueEntityId
      value: number
      quantity: number
    }[]
  }[]
}

export class CustomerWithOrdersAndProducts extends ValueObject<CustomerWithOrdersAndProductsProps> {
  static create(props: CustomerWithOrdersAndProductsProps) {
    return new CustomerWithOrdersAndProducts(props)
  }

  get id() {
    return this.props.id
  }

  get name() {
    return this.props.name
  }

  get orders() {
    return this.props.orders
  }
}
