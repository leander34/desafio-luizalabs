import type { Customer } from '@/types/customer'

import { api } from '../api'

interface GetCustomerHttpRequest {
  id: number
}

interface GetCustomerHttpResponse {
  user: Customer
}

export async function getCustomerHttp({
  id,
}: GetCustomerHttpRequest): Promise<GetCustomerHttpResponse> {
  const { data } = await api.get<GetCustomerHttpResponse>(`/users/${id}`)
  return data
}
