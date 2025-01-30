import type { Customer } from '@/types/customer'

export interface FindOrCreateCustomerParams {
  customerId: number
  name: string
}
export interface ICustomerService {
  findOrCreateCustomer(
    params: FindOrCreateCustomerParams,
  ): Promise<Customer | null>
}
