import type { CustomerRepository } from '@/application/repositories/customers-repository'
import type { OrderFileRepository } from '@/application/repositories/order-file-repository'
import { type Either, left, right } from '@/core/either'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { Customer } from '@/domain/entities/customer'

interface CreateCustomerUseCaseRequest {
  externalCustomerIdFromFile: number
  name: string
  orderFileId: number
}

type CreateCustomerUseCaseResponse = Either<
  BadRequestError | ResourceNotFoundError,
  null
>

export class CreateCustomerUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private orderFileRepository: OrderFileRepository,
  ) {}

  async execute({
    externalCustomerIdFromFile,
    name,
    orderFileId,
  }: CreateCustomerUseCaseRequest): Promise<CreateCustomerUseCaseResponse> {
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

    if (customer) {
      return left(
        new BadRequestError(
          'There is already a user with this id in this order file.',
          'user',
        ),
      )
    }

    const customerCreated = Customer.create({
      name,
      externalCustomerIdFromFile: new UniqueEntityId(
        externalCustomerIdFromFile,
      ),
      orderFileId: new UniqueEntityId(orderFileId),
    })

    await this.customerRepository.create(customerCreated)

    return right(null)
  }
}
