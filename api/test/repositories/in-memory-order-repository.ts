import { generateRandomId } from 'test/utils/generate-random-id'

import type { OrderRepository } from '@/application/repositories/order-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/entities/order.spec'
import { OrderWithProducts } from '@/domain/value-obejcts/order-with-product'

import type { InMemoryOrderRespositoryRepository } from './in-memory-order-product-repository'

export class InMemoryCustomerRepository implements OrderRepository {
  public items: Order[] = []

  constructor(
    private orderProductRespositoy: InMemoryOrderRespositoryRepository,
  ) {}

  async findById(id: number): Promise<Order | null> {
    const order = this.items.find((order) => order.id.toValue() === id)
    if (!order) {
      return null
    }

    return order
  }

  async findManyWithProducts(): Promise<OrderWithProducts[]> {
    const orderWithProducts = await Promise.all(
      this.items.map(async (order) => {
        const orderProducts =
          await this.orderProductRespositoy.findManyByOrderId(
            order.id.toValue(),
          )
        return OrderWithProducts.create({
          id: order.id,
          customerId: order.customerId,
          date: order.date,
          orderProducts,
          total: order.total,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          deletedAt: order.deletedAt,
        })
      }),
    )
    return orderWithProducts
  }

  async findUniqueWithProducts(id: number): Promise<OrderWithProducts | null> {
    const order = this.items.find((order) => order.id.toValue() === id)
    if (!order) return null
    const orderProducts =
      await this.orderProductRespositoy.findManyByOrderId(id)

    return OrderWithProducts.create({
      id: order.id,
      customerId: order.customerId,
      date: order.date,
      orderProducts,
      total: order.total,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      deletedAt: order.deletedAt,
    })
  }

  async create(order: Order): Promise<void> {
    const { createdAt, customerId, date, deletedAt, id, total } = order
    const newOrder = Order.create(
      {
        createdAt,
        customerId,
        date,
        deletedAt,
        total,
      },
      id || new UniqueEntityId(generateRandomId()),
    )
    this.items.push(newOrder)
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

  //   async delete(answerComment: AnswerComment): Promise<void> {
  //     const itemIndex = this.items.findIndex(
  //       (item) => item.id === answerComment.id,
  //     )
  //     this.items.splice(itemIndex, 1)
  //   }
}
