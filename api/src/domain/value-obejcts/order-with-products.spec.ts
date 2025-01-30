import { describe, expect, it } from 'vitest'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'

import { OrderWithProducts } from './order-with-products'

describe('OrderWithProducts', () => {
  it('should create an OrderWithProducts instance with provided props', () => {
    const orderId = new UniqueEntityId(1)
    const customerId = new UniqueEntityId(100)
    const productId = new UniqueEntityId(200)

    const order = OrderWithProducts.create({
      id: orderId,
      customerId,
      date: '2023-01-01',
      total: 150,
      createdAt: new Date(),
      orderProducts: [
        {
          id: new UniqueEntityId(10),
          orderId,
          productId,
          value: 50,
          quantity: 3,
          createdAt: new Date(),
        },
      ],
    })

    expect(order.id.toValue()).toBe(1)
    expect(order.customerId.toValue()).toBe(100)
    expect(order.date).toBe('2023-01-01')
    expect(order.total).toBe(150)
    expect(order.orderProducts.length).toBe(1)
    expect(order.orderProducts[0].id.toValue()).toBe(10)
    expect(order.orderProducts[0].productId.toValue()).toBe(200)
    expect(order.orderProducts[0].value).toBe(50)
    expect(order.orderProducts[0].quantity).toBe(3)
  })
})
