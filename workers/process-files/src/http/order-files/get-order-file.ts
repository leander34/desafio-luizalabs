import type { OrderFile } from '@/types/order-file'

import { api } from '../api'

export interface GetOrderFileHttpRequest {
  orderFileId: number
}

export interface GetOrderFileHttpResponse {
  order_file: OrderFile
}

export async function getOrderFileHttp({
  orderFileId,
}: GetOrderFileHttpRequest): Promise<GetOrderFileHttpResponse> {
  const { data } = await api.get<GetOrderFileHttpResponse>(
    `/files/order/${orderFileId}`,
  )
  return data
}
