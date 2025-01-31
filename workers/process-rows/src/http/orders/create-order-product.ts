import type { OrderProduct } from '@/types/order-product'

import { api } from '../api'
interface CreateOrderProductHttpRequest {
  externalOrderIdFromFile: number
  externalProductIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
  value: number
}

type CreateOrderProductHttpResponse = OrderProduct
export async function createOrderProductHttp({
  externalOrderIdFromFile,
  externalProductIdFromFile,
  externalCustomerIdFromFile,
  orderFileId,
  value,
}: CreateOrderProductHttpRequest): Promise<CreateOrderProductHttpResponse> {
  await api.post(
    `/files/${orderFileId}/users/${externalCustomerIdFromFile}/orders/${externalOrderIdFromFile}/products`,
    {
      product_id: externalProductIdFromFile,
      value,
    },
  )

  return {
    product_id: externalProductIdFromFile,
    value,
    quantity: 1,
  }
}
