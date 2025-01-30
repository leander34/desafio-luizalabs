import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { Order } from './order'

describe('Order', () => {
  it('should create an order with default createdAt and total', () => {
    const order = Order.create({
      date: '2023-01-01',
      customerId: new UniqueEntityId(1),
    })

    expect(order.date).toBe('2023-01-01')
    expect(order.customerId.toValue()).toBe(1)
    expect(order.total).toBe(0)
    expect(order.createdAt).toBeInstanceOf(Date)
    expect(order.updatedAt).toBeUndefined()
    expect(order.deletedAt).toBeUndefined()
  })

  it('should create an order with provided createdAt', () => {
    const createdAt = new Date(2021, 1, 1)
    const order = Order.create(
      {
        date: '2023-01-01',
        customerId: new UniqueEntityId(2),
        createdAt,
        total: 500,
      },
      undefined,
    )

    expect(order.createdAt).toBe(createdAt)
    expect(order.total).toBe(500)
  })

  it('should create an order with a provided UniqueEntityId', () => {
    const uniqueId = new UniqueEntityId(123)
    const order = Order.create(
      {
        date: '2023-01-01',
        customerId: new UniqueEntityId(3),
        total: 150,
      },
      uniqueId,
    )

    expect(order.id.toValue()).toBe(123)
  })

  it('should set deletedAt to undefined if not provided', () => {
    const order = Order.create({
      date: '2023-01-01',
      customerId: new UniqueEntityId(4),
      total: 200,
    })

    expect(order.deletedAt).toBeUndefined()
  })

  it('should create an order with deletedAt when provided', () => {
    const deletedAt = new Date(2023, 1, 1)
    const order = Order.create(
      {
        date: '2023-01-01',
        customerId: new UniqueEntityId(5),
        total: 300,
        deletedAt,
      },
      undefined,
    )

    expect(order.deletedAt).toBe(deletedAt)
  })
})
