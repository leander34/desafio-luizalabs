import { PrismaOrderFileRepository } from '@/infra/database/prisma/repositories/prisma-order-file-repository'
import { makeQueueService } from '@/infra/queue/make-queue-service'
import { makeStorageService } from '@/infra/storage/make-storage-service'

import { UploadOrderFileUseCase } from '../order-files/upload-order-file'

export async function makeUploadOrderFileUseCase({
  queueUri,
}: {
  queueUri: string
}) {
  const orderFileRepository = new PrismaOrderFileRepository()
  const storageService = makeStorageService()
  const queueService = await makeQueueService(queueUri)
  const useCase = new UploadOrderFileUseCase(
    orderFileRepository,
    storageService,
    queueService,
  )
  return useCase
}
