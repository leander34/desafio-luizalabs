import type { CustomerRepository } from '@/application/repositories/customers-repository'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { Customer } from '@/domain/entities/customer'

interface CreateCustomerUseCaseRequest {
  customerId: number | null
  name: string
}

type CreateCustomerUseCaseResponse = Either<BadRequestError, null>

export class CreateCustomerUseCase {
  constructor(private customerRepository: CustomerRepository) {}
  async execute({
    customerId,
    name,
  }: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
    if (customerId) {
      const customer = await this.customerRepository.findById(customerId)

      if (customer) {
        return left(
          new BadRequestError('There is already a user with this Id.', 'user'),
        )
      }
    }

    const customer = Customer.create(
      {
        name,
      },
      customerId ? new UniqueEntityId(customerId) : undefined,
    )

    await this.customerRepository.create(customer)

    return right(null)
  }
}
