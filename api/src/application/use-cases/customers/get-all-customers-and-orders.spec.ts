import { makeCustomer } from 'test/factories/make-customer'
import { InMemoryCustomerRepository } from 'test/repositories/in-memory-customer-repository'
import { InMemoryOrderProductRepository } from 'test/repositories/in-memory-order-product-repository'
import { InMemoryOrderRepository } from 'test/repositories/in-memory-order-repository'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { GetAllCustomersAndOrdersUseCase } from './get-all-customers-and-orders'

const makeSut = () => {
  const orderProductRepository = new InMemoryOrderProductRepository()
  const orderRepository = new InMemoryOrderRepository(orderProductRepository)
  const customerRepository = new InMemoryCustomerRepository(
    orderRepository,
    orderProductRepository,
  )
  const sut = new GetAllCustomersAndOrdersUseCase(customerRepository)
  return {
    sut,
    customerRepository,
  }
}
describe('Get customer', () => {
  it('should be possible to search for all customers with their orders and respective products', async () => {
    const { sut, customerRepository } = makeSut()

    for (let i = 0; i >= 100; i++) {
      const customer = makeCustomer(
        {
          externalCustomerIdFromFile: new UniqueEntityId(i),
          orderFileId: new UniqueEntityId(i),
        },
        new UniqueEntityId(i),
      )
      customerRepository.items.push(customer)
    }

    const result = await sut.execute({
      endDate: null,
      externalOrderIdFromFile: null,
      page: null,
      size: null,
      startDate: null,
    })

    expect(result.isRight()).toBeTruthy()
  })
})
