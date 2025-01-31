import type { CustomerRepository } from '@/application/repositories/customers-repository'
import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Customer } from '@/domain/entities/customer'

interface GetCustomerUseCaseRequest {
  externalCustomerIdFromFile: number
  orderFileId: number
}

type GetCustomerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    customer: Customer
  }
>

export class GetCustomerUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private orderFileRepository: OrderFileRepository,
  ) {}

  async execute({
    externalCustomerIdFromFile,
    orderFileId,
  }: GetCustomerUseCaseRequest): Promise<GetCustomerUseCaseResponse> {
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

    return right({
      customer,
    })
  }
}
