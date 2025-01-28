import type { OrderFile } from '@/types/order-file'

import { api } from '../api'

interface GetOrderFileHttpRequest {
  orderFileId: number
}

interface GetOrderFileHttpResponse {
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
