import type { OrderProduct } from '@/domain/entities/order-product'

export interface FindByOrderIdAndProductIdAndValueParams {
  productId: number
  orderId: number
  value: number
}

export interface OrderProductRepository {
  findByOrderIdAndProductIdAndValue(
    params: FindByOrderIdAndProductIdAndValueParams,
  ): Promise<OrderProduct | null>
  create(orderProduct: OrderProduct): Promise<void>
  increaseQuantity(orderProduct: OrderProduct): Promise<void>
}
