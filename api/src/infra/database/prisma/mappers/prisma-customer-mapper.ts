import { Customer as PrismaCustomer, Prisma } from '@prisma/client'

import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer } from '@/domain/entities/customer'
export class PrismaCustomerMapper {
  static toDomain(prismaCustomer: PrismaCustomer): Customer {
    return Customer.create(
      {
        externalCustomerIdFromFile: new UniqueEntityId(
          prismaCustomer.externalCustomerIdFromFile,
        ),
        orderFileId: new UniqueEntityId(prismaCustomer.orderFileId),
        name: prismaCustomer.name,
        createdAt: prismaCustomer.createdAt,
        updatedAt: prismaCustomer.updatedAt,
        deletedAt: prismaCustomer.deletedAt,
      },
      new UniqueEntityId(prismaCustomer.id),
    )
  }

  static toPrisma(customer: Customer): Prisma.CustomerUncheckedCreateInput {
    return {
      id: customer.id.toDBValue(),
      name: customer.name,
      externalCustomerIdFromFile: customer.externalCustomerIdFromFile.toValue(),
      orderFileId: customer.orderFileId.toValue(),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      deletedAt: customer.deletedAt,
    }
  }
}
