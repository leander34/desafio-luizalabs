import { generateRandomId } from 'test/utils/generate-random-id'

import type { CustomerRepository } from '@/application/repositories/customers-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer } from '@/domain/entities/customer'

export class InMemoryCustomerRepository implements CustomerRepository {
  public items: Customer[] = []

  async findById(id: number): Promise<Customer | null> {
    const customer = this.items.find((customer) => customer.id.toValue() === id)
    if (!customer) {
      return null
    }

    return customer
  }

  //   async findManyByAnswerId(
  //     answerId: string,
  //     { page }: PaginationParams,
  //   ): Promise<AnswerComment[]> {
  //     const answerComments = this.items
  //       .filter((answerComment) => answerComment.answerId.toString() === answerId)
  //       .slice((page - 1) * 20, page * 20)

  //     return answerComments
  //   }

  async create(customer: Customer): Promise<void> {
    const { createdAt, deletedAt, id, name, updatedAt } = customer
    const newCustomer = Customer.create(
      {
        createdAt,
        deletedAt,
        name,
        updatedAt,
      },
      id || new UniqueEntityId(generateRandomId()),
    )
    this.items.push(newCustomer)
  }

  //   async delete(answerComment: AnswerComment): Promise<void> {
  //     const itemIndex = this.items.findIndex(
  //       (item) => item.id === answerComment.id,
  //     )
  //     this.items.splice(itemIndex, 1)
  //   }
}
