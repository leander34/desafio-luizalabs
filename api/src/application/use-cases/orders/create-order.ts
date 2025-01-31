import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/entities/order'

import { BadRequestError } from '../../../core/errors/bad-request-error'
import { ResourceNotFoundError } from '../../../core/errors/resource-not-found-error'
import type { CustomerRepository } from '../../repositories/customers-repository'
import type { OrderRepository } from '../../repositories/order-repository'

interface CreateOrderUseCaseRequest {
  externalOrderIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
  date: string
}

type CreateOrderUseCaseResponse = Either<
  BadRequestError | ResourceNotFoundError,
  null
>

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private orderFileRepository: OrderFileRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    externalOrderIdFromFile,
    externalCustomerIdFromFile,
    orderFileId,
    date,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
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

    if (order) {
      return left(
        new BadRequestError(
          'There is already an order with this id in this file.',
          'order',
        ),
      )
    }

    const createdOrder = Order.create({
      date,
      orderFileId: new UniqueEntityId(orderFileId),
      customerId: customer.id,
      externalOrderIdFromFile: new UniqueEntityId(externalOrderIdFromFile),
    })

    await this.orderRepository.create(createdOrder)

    return right(null)
  }
}
