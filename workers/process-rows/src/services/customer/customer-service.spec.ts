import { AxiosError } from 'axios'
import type { Mock } from 'vitest'

import { createCustomerHttp } from '@/http/customers/create-customer'
import { getCustomerHttp } from '@/http/customers/get-customer'

import { CustomerService } from './customer-service'
vi.mock('@/http/customers/get-customer', () => ({
  getCustomerHttp: vi.fn(),
}))

vi.mock('@/http/customers/create-customer', () => ({
  createCustomerHttp: vi.fn(),
}))

describe('Customer Service', () => {
  it('should be able to get a customer by id', async () => {
    const response = {
      user: {
        user_id: 1,
        name: 'Leander',
      },
    }
    const customerService = new CustomerService()
    ;(getCustomerHttp as Mock).mockResolvedValue(response)

    const result = await customerService.findOrCreateCustomer({
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
      name: 'Leander',
    })

    expect(result).toBe(response.user)
    expect(getCustomerHttp).toHaveBeenCalledTimes(1)
  })

  it('should return null when unable to get the client with a generic error', async () => {
    const customerService = new CustomerService()
    ;(getCustomerHttp as Mock).mockRejectedValue(new Error('API error'))

    const result = await customerService.findOrCreateCustomer({
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
      name: 'Leander',
    })
    expect(result).toBe(null)
    expect(getCustomerHttp).toHaveBeenCalledTimes(1)
  })
  it('must be able to try to search for a client by id and if it does not exist it must create it', async () => {
    const response = {
      user_id: 1,
      name: 'Leander',
    }
    const customerService = new CustomerService()
    ;(getCustomerHttp as Mock).mockRejectedValue(
      new AxiosError(
        'Axios Error',
        '404',
        {} as any,
        {} as any,
        { status: 404 } as any,
      ),
    )
    ;(createCustomerHttp as Mock).mockResolvedValue(response)

    const result = await customerService.findOrCreateCustomer({
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
      name: 'Leander',
    })
    expect(result?.user_id).toBe(response.user_id)
    expect(getCustomerHttp).toHaveBeenCalledTimes(1)
    expect(createCustomerHttp).toHaveBeenCalledTimes(1)
  })
  it('should return null if unable to create client', async () => {
    const customerService = new CustomerService()
    ;(getCustomerHttp as Mock).mockRejectedValue(
      new AxiosError(
        'Axios Error',
        '404',
        {} as any,
        {} as any,
        { status: 404 } as any,
      ),
    )
    ;(createCustomerHttp as Mock).mockRejectedValue(undefined)

    const result = await customerService.findOrCreateCustomer({
      externalCustomerIdFromFile: 1,
      orderFileId: 1,
      name: 'Leander',
    })
    expect(result).toBe(null)
    expect(getCustomerHttp).toHaveBeenCalledTimes(1)
    expect(createCustomerHttp).toHaveBeenCalledTimes(1)
  })
})
