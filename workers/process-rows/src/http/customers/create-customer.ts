import type { Customer } from '@/types/customer'

import { api } from '../api'

interface CreateCustomerHttpRequest {
  customerId: number
  name: string
}

type CreateCustomerHttpResponse = Customer

export async function createCustomerHttp({
  customerId,
  name,
}: CreateCustomerHttpRequest): Promise<CreateCustomerHttpResponse> {
  await api.post(`/users`, {
    user_id: customerId,
    name,
  })

  return {
    user_id: customerId,
    name,
  }
}
