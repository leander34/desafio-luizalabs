import type { Customer } from '@/types/customer'

export interface FindOrCreateCustomerParams {
  externalCustomerIdFromFile: number
  orderFileId: number
  name: string
}
export interface ICustomerService {
  findOrCreateCustomer(
    params: FindOrCreateCustomerParams,
  ): Promise<Customer | null>
}
