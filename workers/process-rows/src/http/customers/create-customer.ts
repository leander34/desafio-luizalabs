import type { Customer } from '@/types/customer'

import { api } from '../api'

interface CreateCustomerHttpRequest {
  externalCustomerIdFromFile: number
  orderFileId: number
  name: string
}

type CreateCustomerHttpResponse = Customer

export async function createCustomerHttp({
  externalCustomerIdFromFile,
  orderFileId,
  name,
}: CreateCustomerHttpRequest): Promise<CreateCustomerHttpResponse> {
  await api.post(`/files/${orderFileId}/users`, {
    user_id: externalCustomerIdFromFile,
    name,
  })

  return {
    user_id: externalCustomerIdFromFile,
    name,
    order_file_id: orderFileId,
  }
}
