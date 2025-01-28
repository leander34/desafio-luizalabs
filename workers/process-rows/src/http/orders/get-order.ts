import type { Order } from '@/types/order'
import type { OrderProduct } from '@/types/order-product'

import { api } from '../api'

interface GetOrderHttpRequest {
  customerId: number
  orderId: number
}

interface GetOrderHttpResponse {
  order: Order & {
    products: OrderProduct
  }
}

export async function getOrderHttp({
  orderId,
}: GetOrderHttpRequest): Promise<GetOrderHttpResponse> {
  const { data } = await api.get<GetOrderHttpResponse>(`/orders/${orderId}`)
  return data
}
