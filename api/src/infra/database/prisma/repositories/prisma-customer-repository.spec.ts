import { makeCustomer } from 'test/factories/make-customer'
import { prismaMock } from 'test/prisma/prisma-mock'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer } from '@/domain/entities/customer'

import { PrismaCustomerRepository } from './prisma-customer-repository'

describe('PrismaCustomerRepository', () => {
  const repository = new PrismaCustomerRepository(prismaMock)

  it('should be able to create a customer', async () => {
    const customer = makeCustomer()

    await repository.create(customer)

    expect(prismaMock.customer.create).toHaveBeenCalledTimes(1)

    expect(prismaMock.customer.create).toHaveBeenCalledWith({
      data: {
        id: customer.id.toDBValue(),
        name: customer.name,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        deletedAt: customer.deletedAt,
      },
    })
  })

  it('should be able to get a customer', async () => {
    const prismaCustomer = makeCustomer({}, new UniqueEntityId(1))
    prismaMock.customer.findUnique.mockResolvedValue({
      id: prismaCustomer.id.toValue(),
      name: prismaCustomer.name,
      createdAt: prismaCustomer.createdAt,
      updatedAt: prismaCustomer.updatedAt,
      deletedAt: prismaCustomer.deletedAt ?? null,
    })

    const customer = await repository.findById(1)

    expect(customer).toBeTruthy()
    expect(customer).instanceOf(Customer)
    expect(customer?.id.toValue()).toBe(prismaCustomer.id.toValue())
    expect(customer?.id.equals(prismaCustomer.id)).toBeTruthy()
    expect(customer?.name).toBe(prismaCustomer.name)
    expect(customer?.createdAt).toBe(prismaCustomer.createdAt)
    expect(customer?.updatedAt).toBe(prismaCustomer.updatedAt)
    expect(prismaMock.customer.findUnique).toHaveBeenCalledTimes(1)

    expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    })
  })

  it('should be return null when trying to get a customer that no exists.', async () => {
    prismaMock.customer.findUnique.mockResolvedValue(null)

    const customer = await repository.findById(1)

    expect(customer).toBeFalsy()
    expect(customer).toBe(null)
    expect(prismaMock.customer.findUnique).toHaveBeenCalledTimes(1)

    expect(prismaMock.customer.findUnique).toHaveBeenCalledWith({
      where: {
        id: 1,
      },
    })
  })
})
