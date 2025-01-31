import { AxiosError } from 'axios'

import { createCustomerHttp } from '@/http/customers/create-customer'
import { getCustomerHttp } from '@/http/customers/get-customer'
import type { Customer } from '@/types/customer'

import type { FindOrCreateCustomerParams, ICustomerService } from './interface'
export class CustomerService implements ICustomerService {
  async findOrCreateCustomer({
    externalCustomerIdFromFile,
    orderFileId,
    name,
  }: FindOrCreateCustomerParams): Promise<Customer | null> {
    try {
      const customerData = await getCustomerHttp({
        externalCustomerIdFromFile,
        orderFileId,
      })
      return customerData.user
    } catch (error) {
      if (error instanceof AxiosError && error.status === 404) {
        try {
          const customerData = await createCustomerHttp({
            externalCustomerIdFromFile,
            orderFileId,
            name,
          })
          return customerData
        } catch (error) {
          return null
        }
      }
      return null
    }
  }
}
