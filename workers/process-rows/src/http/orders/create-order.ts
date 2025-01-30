import type { Order } from '@/types/order'
import type { OrderProduct } from '@/types/order-product'

import { api } from '../api'

interface CreateOrderHttpRequest {
  orderId: number
  customerId: number
  date: string
}

interface CreateOrderHttpResponse {
  order: Order & {
    products: OrderProduct[]
  }
}

export async function createOrderHttp({
  orderId,
  customerId,
  date,
}: CreateOrderHttpRequest): Promise<CreateOrderHttpResponse> {
  await api.post(`/orders`, {
    order_id: orderId,
    user_id: customerId,
    date,
  })

  return {
    order: {
      order_id: orderId,
      date,
      total: 0,
      products: [],
    },
  }
}
