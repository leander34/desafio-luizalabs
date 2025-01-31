import type { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ValueObject } from '@/core/entities/value-object'

interface CustomerWithOrdersAndProductsProps {
  externalCustomerIdFromFile: UniqueEntityId
  name: string
  orders: {
    externalOrderIdFromFile: UniqueEntityId
    date: string
    total: number
    orderProducts: {
      externalProductIdFromFile: UniqueEntityId
      value: number
      quantity: number
    }[]
  }[]
}

export class CustomerWithOrdersAndProducts extends ValueObject<CustomerWithOrdersAndProductsProps> {
  static create(props: CustomerWithOrdersAndProductsProps) {
    return new CustomerWithOrdersAndProducts(props)
  }

  get externalCustomerIdFromFile() {
    return this.props.externalCustomerIdFromFile
  }

  get name() {
    return this.props.name
  }

  get orders() {
    return this.props.orders
  }
}
