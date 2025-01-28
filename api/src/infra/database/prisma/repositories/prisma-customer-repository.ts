import type { CustomerRepository } from '@/application/repositories/customers-repository'
import type { Customer } from '@/domain/entities/customer'
import { prismaClient } from '@/lib/prisma-client'

import { PrismaCustomerMapper } from '../mappers/prisma-customer-mapper'
export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private prisma = prismaClient) {}

  async findById(id: number): Promise<Customer | null> {
    const prismaCustomer = await this.prisma.customer.findUnique({
      where: {
        id,
      },
    })
    if (!prismaCustomer) return null
    return PrismaCustomerMapper.toDomain(prismaCustomer)
  }

  async create(customer: Customer): Promise<void> {
    const customerConvertedToPrisma = PrismaCustomerMapper.toPrisma(customer)
    await this.prisma.customer.create({
      data: customerConvertedToPrisma,
    })
  }
}
