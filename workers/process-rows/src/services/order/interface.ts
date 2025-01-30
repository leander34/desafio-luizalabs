import type { Order } from '@/types/order'
import type { OrderProduct } from '@/types/order-product'

export interface FindOrCreateOrderParams {
  customerId: number
  orderId: number
  date: string
}
export interface AddOrderProductParams {
  productId: number
  orderId: number
  currentProductValue: number
}

export type FindOrCreateOrderReturn =
  | (Order & {
      products: OrderProduct[]
    })
  | null

export interface IOrderService {
  findOrCreateOrder(
    params: FindOrCreateOrderParams,
  ): Promise<FindOrCreateOrderReturn>
  addOrderProduct(params: AddOrderProductParams): Promise<OrderProduct | null>
}
