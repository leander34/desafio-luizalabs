import type { OrderRepository } from '@/application/repositories/order-repository'
import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'

interface GetOrderUseCaseRequest {
  orderId: number
}

type GetOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: OrderWithProducts
  }
>

export class GetOrderUseCase {
  constructor(private orderRepository: OrderRepository) {}
  async execute({
    orderId,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const order = await this.orderRepository.findUniqueWithProducts(orderId)

    if (!order) {
      return left(new ResourceNotFoundError('Order not found.', 'order'))
    }
    return right({
      order,
    })
  }
}
