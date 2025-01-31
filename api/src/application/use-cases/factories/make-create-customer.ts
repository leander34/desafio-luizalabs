import { PrismaCustomerRepository } from '@/infra/database/prisma/repositories/prisma-customer-repository'
import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'

import { CreateCustomerUseCase } from '../customers/create-customer'

export function makeCreateCustomerUseCase() {
  const customerRepository = new PrismaCustomerRepository()
  const orderFileReposiory = new PrismaOrderFileRepository()
  const useCase = new CreateCustomerUseCase(
    customerRepository,
    orderFileReposiory,
  )
  return useCase
}
