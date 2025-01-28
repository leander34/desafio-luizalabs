import { makeCustomer } from 'test/factories/make-customer'
import { prismaMock } from 'test/prisma/prisma-mock'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer } from '@/domain/entities/customer'

import { PrismaOrderFileRepository } from './prisma-order-file-repository'

describe('PrismaOrderFileRepository', () => {
  const repository = new PrismaOrderFileRepository(prismaMock)

  it('should be able to create a order file', async () => {
    const orderFile = makeCustomer()

    await repository.create(orderFile)

    expect(prismaMock.orderFile.create).toHaveBeenCalledTimes(1)

    expect(prismaMock.orderFile.create).toHaveBeenCalledWith({
      data: {
        bucket,
        createdAt,
        deletedAt,
        error,
        id,
        key,
        name,
        status,
        updatedAt,
        url,
      },
    })
  })

  it('should be able to get a order file', async () => {
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

  it('should be return null when trying to get a order file that no exists.', async () => {
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

  it('should be able to update the status and error of order file', async () => {})
})
