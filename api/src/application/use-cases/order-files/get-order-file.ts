import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { OrderFile } from '@/domain/entities/order-file'

import type { OrderFileRepository } from '../../repositories/order-file-repository'

interface GetOrderFileUseCaseRequest {
  orderFileId: number
}

type GetOrderFileUseCaseResponse = Either<
  ResourceNotFoundError,
  { orderFile: OrderFile }
>

export class GetOrderFileUseCase {
  constructor(private orderFileRepository: OrderFileRepository) {}
  async execute({
    orderFileId,
  }: GetOrderFileUseCaseRequest): Promise<GetOrderFileUseCaseResponse> {
    const orderFile = await this.orderFileRepository.findById(orderFileId)

    if (!orderFile) {
      return left(
        new ResourceNotFoundError('Order file not found.', 'order_file'),
      )
    }

    return right({
      orderFile,
    })
  }
}
