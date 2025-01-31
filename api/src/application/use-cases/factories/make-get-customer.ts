import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'
import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'

import { GetCustomerUseCase } from '../customers/get-customer'

export function makeGetCustomerUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const orderFileReposiory = new PrismaOrderFileRepository()
  const useCase = new GetCustomerUseCase(customerRepository, orderFileReposiory)
  return useCase
}
