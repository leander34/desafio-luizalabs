import { makeCustomer } from 'test/factories/make-customer'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'

import { CreateCustomerUseCase } from './create-customer'

const makeSut = () => {
  const customerRepository = new InMemoryCustomerRepository()
  const sut = new CreateCustomerUseCase(customerRepository)
  return {
    sut,
    customerRepository,
  }
}
describe('Create a Customer', () => {
  it('should be able to create a customer passing the id', async () => {
    const { sut, customerRepository } = makeSut()
    const name = 'Leander'
    const result = await sut.execute({
      name,
      customerId: 1,
    })

    expect(result.isRight()).toBeTruthy()
    if (result.isRight()) {
      expect(null).toEqual(result.value)
    }
    expect(customerRepository.items).toHaveLength(1)
    expect(customerRepository.items).toEqual([
      expect.objectContaining({
        id: new UniqueEntityId(1),
        name,
      }),
    ])
  })

  it('should be able to create a customer without passing the id', async () => {
    const { sut, customerRepository } = makeSut()
    const name = 'Leander'
    const result = await sut.execute({
      name,
      customerId: null,
    })

    expect(result.isRight()).toBeTruthy()

    if (result.isRight()) {
      expect(null).toEqual(result.value)
    }

    expect(customerRepository.items).toHaveLength(1)
    expect(customerRepository.items).toEqual([
      expect.objectContaining({
        name,
      }),
    ])
  })

  it('should not be able to create a customer with same id', async () => {
    const { sut, customerRepository } = makeSut()
    const customer1 = makeCustomer({}, new UniqueEntityId(1))
    const customer2 = makeCustomer({}, new UniqueEntityId(1))
    await sut.execute({
      name: customer1.name,
      customerId: customer1.id.toValue(),
    })

    const result = await sut.execute({
      name: customer2.name,
      customerId: customer2.id.toValue(),
    })

    expect(result.isLeft()).toBeTruthy()

    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(BadRequestError)
    }

    expect(customerRepository.items).toHaveLength(1)
    expect(customerRepository.items).toEqual([
      expect.objectContaining({
        name: customer1.name,
      }),
    ])
  })
})
