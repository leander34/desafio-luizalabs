import type { OrderProductRepository } from '@/application/repositories/order-product-repository'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderProduct } from '@/domain/entities/order-product'

import { ResourceNotFoundError } from '../../../core/errors/resource-not-found-error'
import type { OrderRepository } from '../../repositories/order-repository'

interface CreateOrderProductUseCaseRequest {
  orderId: number
  productId: number
  value: number
}

type CreateOrderProductUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateOrderProductUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private orderProductRepository: OrderProductRepository,
  ) {}

  async execute({
    orderId,
    productId,
    value,
  }: CreateOrderProductUseCaseRequest): Promise<CreateOrderProductUseCaseResponse> {
    const orderById = await this.orderRepository.findById(orderId)

    if (!orderById) {
      return left(new ResourceNotFoundError('Order not found.', 'order'))
    }

    const existsAProductWithSameTheValueInTheOrder =
      await this.orderProductRepository.findByOrderIdAndProductIdAndValue({
        orderId,
        productId,
        value,
      })

    if (existsAProductWithSameTheValueInTheOrder) {
      existsAProductWithSameTheValueInTheOrder.increaseQuantity()
      await this.orderProductRepository.increaseQuantity(
        existsAProductWithSameTheValueInTheOrder,
      )
    } else {
      const orderProduct = OrderProduct.create({
        orderId: new UniqueEntityId(orderId),
        productId: new UniqueEntityId(productId),
        value: Number(value.toFixed(2)),
      })
      await this.orderProductRepository.create(orderProduct)
    }

    return right(null)
  }
}
