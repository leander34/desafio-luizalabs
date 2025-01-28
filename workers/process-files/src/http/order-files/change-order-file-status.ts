import type { OrderFileStatus } from '@/types/order-file'

import { api } from '../api'

interface ChangeOrderFileStatusHttpRequest {
  orderFileId: number
  status: OrderFileStatus
  error?: string
}

export async function changeOrderFileStatusHttp({
  orderFileId,
  status,
  error,
}: ChangeOrderFileStatusHttpRequest): Promise<void> {
  await api.patch(`/files/order/${orderFileId}/status`, {
    status,
    error,
  })
}
