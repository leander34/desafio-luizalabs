import { AxiosError } from 'axios'

import { createCustomerHttp } from '@/http/customers/create-customer'
import { getCustomerHttp } from '@/http/customers/get-customer'
interface FindOrCreateCustomerParams {
  customerId: number
  name: string
}
export async function findOrCreateCustomer({
  customerId,
  name,
}: FindOrCreateCustomerParams) {
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
