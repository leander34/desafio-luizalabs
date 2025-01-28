import type { OrderFileStatus } from '@prisma/client'

import { type Either, left, right } from '@/core/either'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type { OrderFileRepository } from '../../repositories/order-file-repository'

interface ChangeOrderFileStatusUseCaseRequest {
  orderFileId: number
  status: OrderFileStatus
  error?: string
}

type ChangeOrderFileStatusUseCaseResponse = Either<
  ResourceNotFoundError | BadRequestError,
  null
>

export class ChangeOrderFileStatusUseCase {
  constructor(private orderFileRepository: OrderFileRepository) {}
  async execute({
    orderFileId,
    error,
    status,
  }: ChangeOrderFileStatusUseCaseRequest): Promise<ChangeOrderFileStatusUseCaseResponse> {
    const orderFile = await this.orderFileRepository.findById(orderFileId)

    if (!orderFile) {
      return left(
        new ResourceNotFoundError('Order file not found.', 'order_file'),
      )
    }

    if (orderFile.status === status) {
      return left(
        new BadRequestError(
          `The status: "${status}" is the current status of the order file.`,
          'order_file',
        ),
      )
    }

    orderFile.status = status
    orderFile.error = error

    await this.orderFileRepository.changeStatus(orderFile)

    return right(null)
  }
}
