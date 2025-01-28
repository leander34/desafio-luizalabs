import { makeCustomer } from 'test/factories/make-customer'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { GetCustomerUseCase } from './get-customer'

const makeSut = () => {
  const customerRepository = new InMemoryCustomerRepository()
  const sut = new GetCustomerUseCase(customerRepository)
  return {
    sut,
    customerRepository,
  }
}
describe('Get a Customer', () => {
  it('should be able to get a customer', async () => {
    const { sut, customerRepository } = makeSut()
    const name = 'Leander'
    await customerRepository.create(
      makeCustomer({ name }, new UniqueEntityId(1)),
    )
    const result = await sut.execute({
      customerId: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(result.value.customer).toEqual(customerRepository.items[0])
    }
    expect(customerRepository.items).toHaveLength(1)
    expect(customerRepository.items).toEqual([
      expect.objectContaining({
        id: new UniqueEntityId(1),
        name,
      }),
    ])
  })

  it('should not be able to get a customer: Not Found Error', async () => {
    const { sut, customerRepository } = makeSut()
    const name = 'Leander'
    await customerRepository.create(
      makeCustomer({ name }, new UniqueEntityId(1)),
    )

    const result = await sut.execute({
      customerId: 2,
    })

    expect(result.isLeft()).toBeTruthy()
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })
})
