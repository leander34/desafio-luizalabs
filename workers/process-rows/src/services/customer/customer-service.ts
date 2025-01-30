import { AxiosError } from 'axios'

import { createCustomerHttp } from '@/http/customers/create-customer'
import { getCustomerHttp } from '@/http/customers/get-customer'
import type { Customer } from '@/types/customer'

import type { FindOrCreateCustomerParams, ICustomerService } from './interface'
export class CustomerService implements ICustomerService {
  async findOrCreateCustomer({
    customerId,
    name,
  }: FindOrCreateCustomerParams): Promise<Customer | null> {
    try {
      const customerData = await getCustomerHttp({ id: customerId })
      return customerData.user
    } catch (error) {
      if (error instanceof AxiosError && error.status === 404) {
        try {
          const customerData = await createCustomerHttp({ customerId, name })
          return customerData
        } catch (error) {
          return null
        }
      }
      return null
    }
  }
}
