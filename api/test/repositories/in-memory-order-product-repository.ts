import type {
  FindByOrderIdAndProductIdAndValueParams,
  OrderProductRepository,
} from '@/application/repositories/order-product-repository'
import type { OrderProduct } from '@/domain/entities/order-product'

export class InMemoryOrderRespositoryRepository
  implements OrderProductRepository
{
  public items: OrderProduct[] = []

  async findByOrderIdAndProductIdAndValue(
    params: FindByOrderIdAndProductIdAndValueParams,
  ): Promise<OrderProduct | null> {
    const orderProduct = this.items.find(
      (item) =>
        item.orderId.toValue() === params.orderId &&
        item.productId.toValue() === params.productId &&
        item.value === params.value,
    )

    if (!orderProduct) return null
    return orderProduct
  }

  async create(orderProduct: OrderProduct): Promise<void> {
    this.items.push(orderProduct)
  }

  async increaseQuantity(orderProduct: OrderProduct): Promise<void> {
    const orderP = this.items.find(
      (item) => item.id.toValue() === orderProduct.id.toValue(),
    )
    if (!orderP) return
    orderP.increaseQuantity()
  }

  async findManyByOrderId(orderId: number): Promise<OrderProduct[]> {
    const products = this.items.filter(
      (orderProduct) => orderProduct.id.toValue() === orderId,
    )
    return products
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

  // async create(customer: Customer): Promise<void> {
  //   this.items.push(customer)
  // }

  //   async delete(answerComment: AnswerComment): Promise<void> {
  //     const itemIndex = this.items.findIndex(
  //       (item) => item.id === answerComment.id,
  //     )
  //     this.items.splice(itemIndex, 1)
  //   }
}
