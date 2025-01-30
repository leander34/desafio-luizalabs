import type { Order } from '@/types/order'
import type { OrderProduct } from '@/types/order-product'

import { api } from '../api'

export interface GetOrderHttpRequest {
  customerId: number
  orderId: number
}

export interface GetOrderHttpResponse {
  order: Order & {
    products: OrderProduct[]
  }
}

export async function getOrderHttp({
  orderId,
}: GetOrderHttpRequest): Promise<GetOrderHttpResponse> {
  const { data } = await api.get<GetOrderHttpResponse>(`/orders/${orderId}`)
  return data
}
