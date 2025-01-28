import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'

import { ChangeOrderFileStatusUseCase } from '../order-files/change-order-file-status'

export function makeChangeOrderFileStatusUseCase() {
  const orderFileRepository = new PrismaOrderFileRepository()
  const useCase = new ChangeOrderFileStatusUseCase(orderFileRepository)
  return useCase
}
