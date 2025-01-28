import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'

import { CreateCustomerUseCase } from '../customers/create-customer'

export function makeCreateCustomerUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const useCase = new CreateCustomerUseCase(customerRepository)
  return useCase
}
