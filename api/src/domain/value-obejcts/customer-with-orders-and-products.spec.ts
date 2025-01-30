import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { CustomerWithOrdersAndProducts } from './customer-with-orders-and-products'

describe('CustomerWithOrdersAndProducts', () => {
  it('should create a CustomerWithOrdersAndProducts instance with provided props', () => {
    const customerId = new UniqueEntityId(1)
    const orderId = new UniqueEntityId(100)
    const productId = new UniqueEntityId(200)

    const customer = CustomerWithOrdersAndProducts.create({
      id: customerId,
      name: 'John Doe',
      orders: [
        {
          id: orderId,
          date: '2023-01-01',
          total: 150,
          orderProducts: [
            {
              productId,
              value: 50,
              quantity: 3,
            },
          ],
        },
      ],
    })

    expect(customer.id.toValue()).toBe(1)
    expect(customer.name).toBe('John Doe')
    expect(customer.orders.length).toBe(1)
    expect(customer.orders[0].id.toValue()).toBe(100)
    expect(customer.orders[0].date).toBe('2023-01-01')
    expect(customer.orders[0].total).toBe(150)
    expect(customer.orders[0].orderProducts[0].productId.toValue()).toBe(200)
    expect(customer.orders[0].orderProducts[0].value).toBe(50)
    expect(customer.orders[0].orderProducts[0].quantity).toBe(3)
  })
})
