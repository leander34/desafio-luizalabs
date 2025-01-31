import type { Order } from '@/types/order'
import type { OrderProduct } from '@/types/order-product'

export interface FindOrCreateOrderParams {
  externalCustomerIdFromFile: number
  externalOrderIdFromFile: number
  orderFileId: number
  date: string
}
export interface AddOrderProductParams {
  externalProductIdFromFile: number
  externalOrderIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
  currentProductValue: number
}

export type FindOrCreateOrderReturn = Order | null

export interface IOrderService {
  findOrCreateOrder(
    params: FindOrCreateOrderParams,
  ): Promise<FindOrCreateOrderReturn>
  addOrderProduct(params: AddOrderProductParams): Promise<OrderProduct | null>
}
