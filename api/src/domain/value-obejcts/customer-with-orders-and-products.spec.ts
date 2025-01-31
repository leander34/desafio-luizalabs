import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { CustomerWithOrdersAndProducts } from './customer-with-orders-and-products'

describe('CustomerWithOrdersAndProducts', () => {
  it('should create a CustomerWithOrdersAndProducts instance with provided props', () => {
    const externalCustomerIdFromFile = new UniqueEntityId(1)
    const externalOrderIdFromFile = new UniqueEntityId(100)
    const externalProductIdFromFile = new UniqueEntityId(200)

    const customer = CustomerWithOrdersAndProducts.create({
      externalCustomerIdFromFile,
      name: 'John Doe',
      orders: [
        {
          externalOrderIdFromFile,
          date: '2023-01-01',
          total: 150,
          orderProducts: [
            {
              externalProductIdFromFile,
              value: 50,
              quantity: 3,
            },
          ],
        },
      ],
    })

    expect(customer.externalCustomerIdFromFile.toValue()).toBe(1)
    expect(customer.name).toBe('John Doe')
    expect(customer.orders.length).toBe(1)
    expect(customer.orders[0].externalOrderIdFromFile.toValue()).toBe(100)
    expect(customer.orders[0].date).toBe('2023-01-01')
    expect(customer.orders[0].total).toBe(150)
    expect(
      customer.orders[0].orderProducts[0].externalProductIdFromFile.toValue(),
    ).toBe(200)
    expect(customer.orders[0].orderProducts[0].value).toBe(50)
    expect(customer.orders[0].orderProducts[0].quantity).toBe(3)
  })
})
