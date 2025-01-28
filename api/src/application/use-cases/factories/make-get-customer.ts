import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'

import { GetCustomerUseCase } from '../customers/get-customer'

export function makeGetCustomerUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const useCase = new GetCustomerUseCase(customerRepository)
  return useCase
}
