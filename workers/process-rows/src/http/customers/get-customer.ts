import type { Customer } from '@/types/customer'

import { api } from '../api'

export interface GetCustomerHttpRequest {
  externalCustomerIdFromFile: number
  orderFileId: number
}

export interface GetCustomerHttpResponse {
  user: Customer
}

export async function getCustomerHttp({
  orderFileId,
  externalCustomerIdFromFile,
}: GetCustomerHttpRequest): Promise<GetCustomerHttpResponse> {
  const { data } = await api.get<GetCustomerHttpResponse>(
    `/files/${orderFileId}/users/${externalCustomerIdFromFile}`,
  )
  return data
}
