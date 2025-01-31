import type { Order } from '@/types/order'

import { api } from '../api'

interface CreateOrderHttpRequest {
  externalOrderIdFromFile: number
  externalCustomerIdFromFile: number
  orderFileId: number
  date: string
}

interface CreateOrderHttpResponse {
  order: Order
}

export async function createOrderHttp({
  externalOrderIdFromFile,
  externalCustomerIdFromFile,
  date,
  orderFileId,
}: CreateOrderHttpRequest): Promise<CreateOrderHttpResponse> {
  await api.post(
    `/files/${orderFileId}/users/${externalCustomerIdFromFile}/orders`,
    {
      order_id: externalOrderIdFromFile,
      date,
    },
  )

  return {
    order: {
      order_id: externalOrderIdFromFile,
      date,
      total: 0,
    },
  }
}
