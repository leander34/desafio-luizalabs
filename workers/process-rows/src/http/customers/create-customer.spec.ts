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

    const orderFileId = 1
    const result = await createCustomerHttp({
      externalCustomerIdFromFile: customer.customerId,
      orderFileId,
      name: customer.name,
    })
    expect(result.user_id).toBe(customer.customerId)
    expect(result.name).toBe(customer.name)

    expect(api.post).toHaveBeenCalledWith(`/files/${orderFileId}/users`, {
      user_id: customer.customerId,
      name: customer.name,
    })
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.post as Mock).mockRejectedValueOnce(new Error('API error'))
    const customer = { customerId: 1, name: 'Leander' }

    const orderFileId = 1

    await expect(
      createCustomerHttp({
        externalCustomerIdFromFile: customer.customerId,
        orderFileId,
        name: customer.name,
      }),
    ).rejects.toThrow('API error')

    expect(api.post).toHaveBeenCalledWith(`/files/${orderFileId}/users`, {
      user_id: customer.customerId,
      name: customer.name,
    })
  })
})
