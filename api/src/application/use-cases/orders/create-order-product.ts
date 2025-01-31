import type { CustomerRepository } from '@/application/repositories/customers-repository'
import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import type { OrderProductRepository } from '@/application/repositories/order-product-repository'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { OrderProduct } from '@/domain/entities/order-product'

import { ResourceNotFoundError } from '../../../core/errors/resource-not-found-error'
import type { OrderRepository } from '../../repositories/order-repository'

interface CreateOrderProductUseCaseRequest {
  externalOrderIdFromFile: number
  externalProductIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
  value: number
}

type CreateOrderProductUseCaseResponse = Either<ResourceNotFoundError, null>

export class CreateOrderProductUseCase {
  constructor(
    private orderRepository: OrderRepository,
    private orderFileRepository: OrderFileRepository,
    private customerRepository: CustomerRepository,
    private orderProductRepository: OrderProductRepository,
  ) {}

  async execute({
    orderFileId,
    externalOrderIdFromFile,
    externalProductIdFromFile,
    externalCustomerIdFromFile,
    value,
  }: CreateOrderProductUseCaseRequest): Promise<CreateOrderProductUseCaseResponse> {
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

    const existsAProductWithSameTheValueInTheOrder =
      await this.orderProductRepository.findByOrderIdAndExtProductIdAndValue({
        orderId: order.id.toValue(),
        externalProductIdFromFile,
        value,
      })

    if (existsAProductWithSameTheValueInTheOrder) {
      existsAProductWithSameTheValueInTheOrder.increaseQuantity()
      await this.orderProductRepository.increaseQuantity(
        existsAProductWithSameTheValueInTheOrder,
      )
    } else {
      const orderProduct = OrderProduct.create({
        orderId: order.id,
        externalProductIdFromFile: new UniqueEntityId(
          externalProductIdFromFile,
        ),
        value: Number(value.toFixed(2)),
      })
      await this.orderProductRepository.create(orderProduct)
    }

    return right(null)
  }
}
