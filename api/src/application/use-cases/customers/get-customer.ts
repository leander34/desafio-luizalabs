import type { CustomerRepository } from '@/application/repositories/customers-repository'
import { type Either, left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import type { Customer } from '@/domain/entities/customer'

interface GetCustomerUseCaseRequest {
  customerId: number
}

type GetCustomerUseCaseResponse = Either<
  ResourceNotFoundError,
  {
    customer: Customer
  }
>

export class GetCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}
  async execute({
    customerId,
  }: GetCustomerUseCaseRequest): Promise<GetCustomerUseCaseResponse> {
    const customer = await this.customerRepository.findById(customerId)

    if (!customer) {
      return left(new ResourceNotFoundError('User not found.', 'user'))
    }

    return right({
      customer,
    })
  }
}
