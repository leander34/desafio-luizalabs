import type { OrderProduct } from '@/types/order-product'

import { api } from '../api'
interface CreateOrderProductHttpRequest {
  orderId: number
  productId: number
  value: number
}

type CreateOrderProductHttpResponse = OrderProduct
export async function createOrderProductHttp({
  orderId,
  productId,
  value,
}: CreateOrderProductHttpRequest): Promise<CreateOrderProductHttpResponse> {
  await api.post(`/orders/${orderId}/products`, {
    product_id: productId,
    value,
  })

  return {
    product_id: productId,
    value,
    quantity: 1,
  }
}
