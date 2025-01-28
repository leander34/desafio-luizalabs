import type { OrderRepository } from '@/application/repositories/order-repository'
import { type Either, right } from '@/core/either'
import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'

interface GetOrdersUseCaseRequest {
  startDate: string | null
  endDate: string | null
  name: string | null
  orderId: number | null
  customerId: number | null
  page: number | null
  size: number | null
}

type GetOrdersUseCaseResponse = Either<
  null,
  {
    orders: OrderWithProducts[]
  }
>

export class GetOrdersUseCase {
  constructor(private orderRepository: OrderRepository) {}
  async execute({
    startDate,
    endDate,
    customerId,
    name,
    orderId,
    page,
    size,
  }: GetOrdersUseCaseRequest): Promise<GetOrdersUseCaseResponse> {
    const orders = await this.orderRepository.findManyWithProducts(
      {
        startDate,
        endDate,
        customerId,
        name,
        orderId,
      },
      {
        page,
        size,
      },
    )
    return right({
      orders,
    })
  }
}
