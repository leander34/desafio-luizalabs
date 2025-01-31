import type { Order } from '@/types/order'

import { api } from '../api'

export interface GetOrderHttpRequest {
  externalOrderIdFromFile: number
  orderFileId: number
  externalCustomerIdFromFile: number
}

export interface GetOrderHttpResponse {
  order: Order
}

export async function getOrderHttp({
  externalOrderIdFromFile,
  orderFileId,
  externalCustomerIdFromFile,
}: GetOrderHttpRequest): Promise<GetOrderHttpResponse> {
  const { data } = await api.get<GetOrderHttpResponse>(
    `/files/${orderFileId}/users/${externalCustomerIdFromFile}/orders/${externalOrderIdFromFile}`,
  )
  return data
}
