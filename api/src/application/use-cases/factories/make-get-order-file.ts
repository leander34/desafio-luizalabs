import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'

import { GetOrderFileUseCase } from '../order-files/get-order-file'

export function makeGetOrderFileUseCase() {
  const orderFileRepository = new PrismaOrderFileRepository()
  const useCase = new GetOrderFileUseCase(orderFileRepository)
  return useCase
}
