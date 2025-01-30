import type { CustomerRepository } from '@/application/repositories/customers-repository'
import { type Either, right } from '@/core/either'
import type { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'

interface GetAllCustomersAndOrdersUseCaseRequest {
  startDate: string | null
  endDate: string | null
  orderId: number | null
  page: number | null
  size: number | null
}

type GetAllCustomersAndOrdersUseCaseResponse = Either<
  null,
  {
    customerWithOrders: CustomerWithOrdersAndProducts[]
  }
>

export class GetAllCustomersAndOrdersUseCase {
  constructor(private customerRepository: CustomerRepository) {}
  async execute({
    startDate,
    endDate,
    orderId,
    page,
    size,
  }: GetAllCustomersAndOrdersUseCaseRequest): Promise<GetAllCustomersAndOrdersUseCaseResponse> {
    const customerWithOrders =
      await this.customerRepository.findManyWithOrdersAndProducts(
        {
          startDate,
          endDate,
          orderId,
        },
        {
          page,
          size,
        },
      )
    return right({
      customerWithOrders,
    })
  }
}
