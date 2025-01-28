import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/entities/order'

import { BadRequestError } from '../../../core/errors/bad-request-error'
import { ResourceNotFoundError } from '../../../core/errors/resource-not-found-error'
import type { CustomerRepository } from '../../repositories/customers-repository'
import type { OrderRepository } from '../../repositories/order-repository'

interface CreateOrderUseCaseRequest {
  orderId: number | null
  customerId: number
  date: string
}

type CreateOrderUseCaseResponse = Either<
  BadRequestError | ResourceNotFoundError,
  null
>

export class CreateOrderUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private customerRepository: CustomerRepository,
  ) {}

  async execute({
    orderId,
    customerId,
    date,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    if (orderId) {
      const orderById = await this.orderRepository.findById(orderId)

      if (orderById) {
        return left(
          new BadRequestError(
            'There is already an order with this Id.',
            'order',
          ),
        )
      }
    }

    const customerById = this.customerRepository.findById(customerId)

    if (!customerById) {
      return left(new ResourceNotFoundError('User not found.', 'user'))
    }

    const order = Order.create(
      {
        date,
        customerId: new UniqueEntityId(customerId),
      },
      orderId ? new UniqueEntityId(orderId) : undefined,
    )

    await this.orderRepository.create(order)

    return right(null)
  }
}
