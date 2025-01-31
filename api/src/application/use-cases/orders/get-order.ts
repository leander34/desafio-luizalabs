import type { CustomerRepository } from '@/application/repositories/customers-repository'
import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import type { OrderRepository } from '@/application/repositories/order-repository'
import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Order } from '@/domain/entities/order'

interface GetOrderUseCaseRequest {
  externalOrderIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
}

type GetOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    order: Order
  }
>

export class GetOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private orderFileRepository: OrderFileRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    externalOrderIdFromFile,
    orderFileId,
    externalCustomerIdFromFile,
  }: GetOrderUseCaseRequest): Promise<GetOrderUseCaseResponse> {
    const orderFile = await this.orderFileRepository.findById(orderFileId)

    if (!orderFile) {
      return left(
        new ResourceNotFoundError('Order file not found.', 'order_file'),
      )
    }

    const customer =
      await this.customerRepository.findUniqueByExternalIdAndFileId({
        externalCustomerIdFromFile,
        orderFileId,
      })

    if (!customer) {
      return left(
        new ResourceNotFoundError('User not found in this order file.', 'user'),
      )
    }
    const order = await this.orderRepository.findUniqueByExternalIdAndFileId({
      externalOrderIdFromFile,
      orderFileId,
      externalCustomerIdFromFile,
    })

    if (!order) {
      return left(
        new ResourceNotFoundError(
          'Order not found in this order file.',
          'order',
        ),
      )
    }

    return right({
      order,
    })
  }
}
