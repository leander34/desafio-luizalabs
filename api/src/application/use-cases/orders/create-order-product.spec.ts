import { makeCustomer } from 'test/factories/make-customer'
import { makeOrder } from 'test/factories/make-order'
import { makeOrderFile } from 'test/factories/make-order-file'
import { makeOrderProduct } from 'test/factories/make-order-product'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'
import { InMemoryOrderProductRepository } from 'test/repositories/in-memory-order-product-repository'
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { CreateOrderProductUseCase } from './create-order-product'

const makeSut = () => {
  const orderProductRepository = new InMemoryOrderProductRepository()
  const orderRepository = new InMemoryOrderRepository(orderProductRepository)
  const orderFileRepository = new InMemoryOrderFileRepository()
  const customerRepository = new InMemoryCustomerRepository(
    orderRepository,
    orderProductRepository,
  )
  const sut = new CreateOrderProductUseCase(
    orderRepository,
    orderFileRepository,
    customerRepository,
    orderProductRepository,
  )
  return {
    sut,
    orderProductRepository,
    orderRepository,
    customerRepository,
    orderFileRepository,
  }
}
describe('Get order product', () => {
  it('should not be possible to create an order product if the file does not exist', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      externalCustomerIdFromFile: 1,
      externalOrderIdFromFile: 1,
      externalProductIdFromFile: 1,
      orderFileId: 1,
      value: 100,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to create an order product if the customer does not exist in that file', async () => {
    const { sut, orderFileRepository } = makeSut()

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    const customer = makeCustomer(
      { orderFileId: new UniqueEntityId(2) },
      new UniqueEntityId(1),
    )
    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      externalOrderIdFromFile: 1,
      orderFileId: orderFile.id.toValue(),
      value: 100,
      externalProductIdFromFile: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to create an order product if the order does not exists', async () => {
    const { sut, orderFileRepository, customerRepository } = makeSut()

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    const customer = makeCustomer(
      {
        orderFileId: orderFile.id,
        externalCustomerIdFromFile: new UniqueEntityId(1),
      },
      new UniqueEntityId(1),
    )

    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      externalOrderIdFromFile: 1,
      orderFileId: orderFile.id.toValue(),
      value: 100,
      externalProductIdFromFile: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be possible to create an order product', async () => {
    const {
      sut,
      orderFileRepository,
      customerRepository,
      orderRepository,
      orderProductRepository,
    } = makeSut()
    const spy = vi.spyOn(orderProductRepository, 'create')

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    const customer = makeCustomer(
      {
        orderFileId: orderFile.id,
        externalCustomerIdFromFile: new UniqueEntityId(1),
      },
      new UniqueEntityId(1),
    )
    const order = makeOrder({
      externalOrderIdFromFile: new UniqueEntityId(1),
      orderFileId: orderFile.id,
    })

    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)
    await orderRepository.create(order)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      externalOrderIdFromFile: 1,
      orderFileId: orderFile.id.toValue(),
      externalProductIdFromFile: 1,
      value: 100,
    })

    expect(result.isRight()).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should be possible to update the quantity of the product if it already exists with the same value', async () => {
    const {
      sut,
      orderFileRepository,
      customerRepository,
      orderRepository,
      orderProductRepository,
    } = makeSut()
    const increaseQuantitySpy = vi.spyOn(
      orderProductRepository,
      'increaseQuantity',
    )
    const createSpy = vi.spyOn(orderProductRepository, 'create')

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    const customer = makeCustomer(
      {
        orderFileId: orderFile.id,
        externalCustomerIdFromFile: new UniqueEntityId(1),
      },
      new UniqueEntityId(1),
    )
    const order = makeOrder({
      externalOrderIdFromFile: new UniqueEntityId(1),
      orderFileId: orderFile.id,
    })
    const orderProduct = makeOrderProduct({
      externalProductIdFromFile: new UniqueEntityId(1),
      orderId: order.id,
      value: 100,
    })

    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)
    await orderRepository.create(order)
    await orderProductRepository.create(orderProduct)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      externalOrderIdFromFile: order.externalOrderIdFromFile.toValue(),
      orderFileId: orderFile.id.toValue(),
      externalProductIdFromFile:
        orderProduct.externalProductIdFromFile.toValue(),
      value: 100,
    })

    expect(result.isRight()).toBeTruthy()
    expect(increaseQuantitySpy).toHaveBeenCalledTimes(1)
    expect(createSpy).toHaveBeenCalledTimes(1)
  })
})
