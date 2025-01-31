import { makeCustomer } from 'test/factories/make-customer'
import { makeOrder } from 'test/factories/make-order'
import { makeOrderFile } from 'test/factories/make-order-file'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'
import { InMemoryOrderProductRepository } from 'test/repositories/in-memory-order-product-repository'
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { CreateOrderUseCase } from './create-order'

const makeSut = () => {
  const orderProductRepository = new InMemoryOrderProductRepository()
  const orderRepository = new InMemoryOrderRepository(orderProductRepository)
  const orderFileRepository = new InMemoryOrderFileRepository()
  const customerRepository = new InMemoryCustomerRepository(
    orderRepository,
    orderProductRepository,
  )
  const sut = new CreateOrderUseCase(
    orderRepository,
    orderFileRepository,
    customerRepository,
  )
  return {
    sut,
    orderProductRepository,
    orderRepository,
    customerRepository,
    orderFileRepository,
  }
}
describe('Get order', () => {
  it('should not be possible to create an order if the file does not exist', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      externalCustomerIdFromFile: 1,
      externalOrderIdFromFile: 1,
      orderFileId: 1,
      date: '2024-01-10',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to create an order if the customer does not exist in that file', async () => {
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
      date: '2024-01-10',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to create an order if it already exists', async () => {
    const { sut, orderFileRepository, customerRepository, orderRepository } =
      makeSut()

    const orderFile = makeOrderFile({}, new UniqueEntityId(1))
    const customer = makeCustomer(
      {
        orderFileId: orderFile.id,
        externalCustomerIdFromFile: new UniqueEntityId(1),
      },
      new UniqueEntityId(1),
    )
    const order = makeOrder({
      orderFileId: orderFile.id,
      externalOrderIdFromFile: new UniqueEntityId(1),
    })
    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)
    await orderRepository.create(order)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      externalOrderIdFromFile: order.externalOrderIdFromFile.toValue(),
      orderFileId: orderFile.id.toValue(),
      date: '2024-01-10',
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(BadRequestError)
  })

  it('should be possible to create an order', async () => {
    const { sut, orderFileRepository, customerRepository, orderRepository } =
      makeSut()
    const spy = vi.spyOn(orderRepository, 'create')

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
      date: '2024-01-10',
    })

    expect(result.isRight()).toBeTruthy()
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
