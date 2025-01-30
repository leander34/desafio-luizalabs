import { UniqueEntityId } from '../../core/entities/unique-entity-id'
import { OrderProduct } from './order-product'

describe('OrderProduct', () => {
  it('should create an order product with default createdAt and quantity', () => {
    const orderProduct = OrderProduct.create({
      orderId: new UniqueEntityId(1),
      productId: new UniqueEntityId(101),
      value: 100,
    })

    expect(orderProduct.orderId.toValue()).toBe(1)
    expect(orderProduct.productId.toValue()).toBe(101)
    expect(orderProduct.value).toBe(100)
    expect(orderProduct.quantity).toBe(1)
    expect(orderProduct.createdAt).toBeInstanceOf(Date)
    expect(orderProduct.updatedAt).toBeUndefined()
    expect(orderProduct.deletedAt).toBeUndefined()
  })

  it('should create an order product with provided createdAt', () => {
    const createdAt = new Date(2021, 1, 1)
    const orderProduct = OrderProduct.create(
      {
        orderId: new UniqueEntityId(1),
        productId: new UniqueEntityId(102),
        value: 150,
        createdAt,
        quantity: 3,
      },
      undefined,
    )

    expect(orderProduct.createdAt).toBe(createdAt)
  })

  it('should create an order product with a provided UniqueEntityId', () => {
    const uniqueId = new UniqueEntityId(123)
    const orderProduct = OrderProduct.create(
      {
        orderId: new UniqueEntityId(1),
        productId: new UniqueEntityId(104),
        value: 250,
        quantity: 2,
      },
      uniqueId,
    )

    expect(orderProduct.id.toValue()).toBe(123)
  })

  it('should increase the quantity of the order product', () => {
    const orderProduct = OrderProduct.create({
      orderId: new UniqueEntityId(1),
      productId: new UniqueEntityId(103),
      value: 50,
      quantity: 5,
    })

    expect(orderProduct.quantity).toBe(5)
    orderProduct.increaseQuantity()
    expect(orderProduct.quantity).toBe(6)
  })

  it('should set deletedAt to undefined if not provided', () => {
    const orderProduct = OrderProduct.create({
      orderId: new UniqueEntityId(1),
      productId: new UniqueEntityId(105),
      value: 200,
      quantity: 10,
    })

    expect(orderProduct.deletedAt).toBeUndefined()
  })

  it('should create an order product with deletedAt when provided', () => {
    const deletedAt = new Date(2023, 1, 1)
    const orderProduct = OrderProduct.create(
      {
        orderId: new UniqueEntityId(1),
        productId: new UniqueEntityId(106),
        value: 400,
        quantity: 1,
        deletedAt,
      },
      undefined,
    )

    expect(orderProduct.deletedAt).toBe(deletedAt)
  })

  it('should correctly calculate the total value based on value and quantity', () => {
    const orderProduct = OrderProduct.create({
      orderId: new UniqueEntityId(1),
      productId: new UniqueEntityId(107),
      value: 100,
      quantity: 3,
    })

    const totalValue = orderProduct.value * orderProduct.quantity
    expect(totalValue).toBe(300)
  })
})
