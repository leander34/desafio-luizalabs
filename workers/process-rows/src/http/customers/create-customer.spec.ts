import { Mock } from 'vitest'

import { api } from '@/http/api'

import { createCustomerHttp } from './create-customer'

vi.mock('@/http/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('Create Customer Htpp', () => {
  it('should create a customer via http', async () => {
    ;(api.post as Mock).mockResolvedValue(undefined)
    const customer = { customerId: 1, name: 'Leander' }

    const result = await createCustomerHttp({
      customerId: customer.customerId,
      name: customer.name,
    })
    expect(result.user_id).toBe(customer.customerId)
    expect(result.name).toBe(customer.name)

    expect(api.post).toHaveBeenCalledWith(`/users`, {
      user_id: customer.customerId,
      name: customer.name,
    })
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.post as Mock).mockRejectedValueOnce(new Error('API error'))
    const customer = { customerId: 1, name: 'Leander' }

    await expect(
      createCustomerHttp({
        customerId: customer.customerId,
        name: customer.name,
      }),
    ).rejects.toThrow('API error')

    expect(api.post).toHaveBeenCalledWith(`/users`, {
      user_id: customer.customerId,
      name: customer.name,
    })
  })
})
