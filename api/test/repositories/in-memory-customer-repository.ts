import { generateRandomId } from 'test/utils/generate-random-id'

import type {
  CustomerRepository,
  FindManyWithOrdersAndProductsParams,
  FindUniqueByExternalIdAndFileIdParams,
} from '@/application/repositories/customers-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Customer } from '@/domain/entities/customer'
import { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'
import { PrismaCustomerWithProductsMapper } from '@/infra/database/prisma/mappers/prisma-customer-with-products-mapper'

import type { InMemoryOrderProductRepository } from './in-memory-order-product-repository'
import type { InMemoryOrderRepository } from './in-memory-order-repository'

export class InMemoryCustomerRepository implements CustomerRepository {
  public items: Customer[] = []

  constructor(
    private ordersRepository: InMemoryOrderRepository,
    private orderProductsRepository: InMemoryOrderProductRepository,
  ) {}

  async findUniqueByExternalIdAndFileId({
    externalCustomerIdFromFile,
    orderFileId,
  }: FindUniqueByExternalIdAndFileIdParams): Promise<Customer | null> {
    const customer = this.items.find((customer) => {
      return (
        customer.externalCustomerIdFromFile.toValue() ===
          externalCustomerIdFromFile &&
        customer.orderFileId.toValue() === orderFileId
      )
    })

    if (!customer) {
      return null
    }

    return customer
  }

  async findManyWithOrdersAndProducts({
    externalOrderIdFromFile,
  }: FindManyWithOrdersAndProductsParams): Promise<
    CustomerWithOrdersAndProducts[]
  > {
    const usersWithOrderAndProducts = this.items.map((user) => {
      const orders = this.ordersRepository.items
        .filter(
          (order) =>
            user.orderFileId === order.orderFileId &&
            order.customerId.toValue() === user.id.toValue(),
        )
        .map((item) => {
          const products = this.orderProductsRepository.items.filter(
            (op) => op.orderId.toValue() === item.id.toValue(),
          )
          return {
            externalOrderIdFromFile: item.externalOrderIdFromFile.toValue(),
            date: item.date,
            total: products.reduce(
              (acc, item) => acc + item.value * item.quantity,
              0,
            ),
            orderProducts: products.map((p) => ({
              quantity: p.quantity,
              externalProductIdFromFile: p.externalProductIdFromFile.toValue(),
              value: p.value,
            })),
          }
        })

      return {
        externalCustomerIdFromFile: user.externalCustomerIdFromFile.toValue(),
        name: user.name,
        orders,
      }
    })

    const usersByExternalOrderIdFromFile = usersWithOrderAndProducts.filter(
      (user) => {
        if (externalOrderIdFromFile) {
          return user.externalCustomerIdFromFile === externalOrderIdFromFile
        } else {
          return true
        }
      },
    )

    // const usersByPeriod = usersByExternalOrderIdFromFile.filter((user) => {
    //   if (externalOrderIdFromFile) {
    //     return user.externalCustomerIdFromFile === externalOrderIdFromFile
    //   } else {
    //     return true
    //   }
    // })

    return usersByExternalOrderIdFromFile.map(
      PrismaCustomerWithProductsMapper.toDomain,
    )
  }

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
    const {
      createdAt,
      deletedAt,
      id,
      name,
      updatedAt,
      externalCustomerIdFromFile,
      orderFileId,
    } = customer
    const newCustomer = Customer.create(
      {
        externalCustomerIdFromFile,
        orderFileId,
        createdAt,
        deletedAt,
        name,
        updatedAt,
      },
      id.toDBValue() === -1 ? new UniqueEntityId(generateRandomId()) : id,
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
