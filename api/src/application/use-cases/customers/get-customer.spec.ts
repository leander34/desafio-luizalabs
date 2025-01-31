import { makeCustomer } from 'test/factories/make-customer'
import { makeOrderFile } from 'test/factories/make-order-file'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'
import { InMemoryOrderProductRepository } from 'test/repositories/in-memory-order-product-repository'
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { GetCustomerUseCase } from './get-customer'

const makeSut = () => {
  const orderProductRepository = new InMemoryOrderProductRepository()
  const orderRepository = new InMemoryOrderRepository(orderProductRepository)
  const customerRepository = new InMemoryCustomerRepository(
    orderRepository,
    orderProductRepository,
  )
  const orderFileRepository = new InMemoryOrderFileRepository()
  const sut = new GetCustomerUseCase(customerRepository, orderFileRepository)
  return {
    sut,
    customerRepository,
    orderFileRepository,
  }
}
describe('Get customer', () => {
  it('should not be possible to search for a user if the file does not exist', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to search for a user that is not in the file', async () => {
    const { sut, orderFileRepository } = makeSut()

    const orderFile = makeOrderFile()
    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      externalCustomerIdFromFile: 122,
      orderFileId: orderFile.id.toValue(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should be able to get a customer', async () => {
    const { sut, customerRepository, orderFileRepository } = makeSut()

    const orderFile = makeOrderFile()
    const customer = makeCustomer({
      orderFileId: orderFile.id,
      externalCustomerIdFromFile: new UniqueEntityId(1),
    })
    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)

    const result = await sut.execute({
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      orderFileId: orderFile.id.toValue(),
    })

    expect(result.isRight()).toBeTruthy()
  })
})
