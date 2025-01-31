import { makeCustomer } from 'test/factories/make-customer'
import { makeOrderFile } from 'test/factories/make-order-file'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'
import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'
import { InMemoryOrderProductRepository } from 'test/repositories/in-memory-order-product-repository'
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { CreateCustomerUseCase } from './create-customer'

const makeSut = () => {
  const orderProductRepository = new InMemoryOrderProductRepository()
  const orderRepository = new InMemoryOrderRepository(orderProductRepository)
  const customerRepository = new InMemoryCustomerRepository(
    orderRepository,
    orderProductRepository,
  )
  const orderFileRepository = new InMemoryOrderFileRepository()
  const sut = new CreateCustomerUseCase(customerRepository, orderFileRepository)
  return {
    sut,
    customerRepository,
    orderFileRepository,
  }
}
describe('Create customer', () => {
  it('should not be possible to create a user with a file that does not exist', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      name: 'Leander',
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should not be possible to create a user that has already been created with the file', async () => {
    const { sut, customerRepository, orderFileRepository } = makeSut()

    const orderFile = makeOrderFile()
    const customer = makeCustomer({
      orderFileId: orderFile.id,
      externalCustomerIdFromFile: new UniqueEntityId(1),
    })
    await orderFileRepository.create(orderFile)
    await customerRepository.create(customer)

    const result = await sut.execute({
      name: 'Leander',
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      orderFileId: customer.orderFileId.toValue(),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(BadRequestError)
  })

  it('should be able to create a customer', async () => {
    const { sut, customerRepository, orderFileRepository } = makeSut()
    const customerRepositoryCreateSpy = vi.spyOn(customerRepository, 'create')

    const orderFile = makeOrderFile()
    const customer = makeCustomer({
      orderFileId: orderFile.id,
      externalCustomerIdFromFile: new UniqueEntityId(1),
    })
    await orderFileRepository.create(orderFile)

    const result = await sut.execute({
      name: customer.name,
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      orderFileId: customer.orderFileId.toValue(),
    })

    expect(result.isRight()).toBeTruthy()
    expect(customerRepository.items.length).toBe(1)
    expect(customerRepositoryCreateSpy).toHaveBeenCalledTimes(1)
  })
})
