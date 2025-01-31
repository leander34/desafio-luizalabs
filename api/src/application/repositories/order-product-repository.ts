import type { OrderProduct } from '@/domain/entities/order-product'

export interface FindByExtOrderIdAndExtProductIdAndValueParams {
  externalProductIdFromFile: number
  orderId: number
  value: number
}

export interface OrderProductRepository {
  findByOrderIdAndExtProductIdAndValue(
    params: FindByExtOrderIdAndExtProductIdAndValueParams,
  ): Promise<OrderProduct | null>
  create(orderProduct: OrderProduct): Promise<void>
  increaseQuantity(orderProduct: OrderProduct): Promise<void>
}
