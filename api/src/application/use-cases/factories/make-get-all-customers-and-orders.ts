import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'

import { GetAllCustomersAndOrdersUseCase } from '../customers/get-all-customers-and-orders'

export function makeGetAllCustomersAndOrdersUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const useCase = new GetAllCustomersAndOrdersUseCase(customerRepository)
  return useCase
}
