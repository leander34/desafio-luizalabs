import { Mock } from 'vitest'

import { api } from '@/http/api'

import { getCustomerHttp } from './get-customer'

vi.mock('@/http/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('Get Customer Http', () => {
  it('should fetch and return customer data', async () => {
    const response = {
      data: {
        user: {
          user_id: 1,
          name: 'Leander',
        },
      },
    }
    ;(api.get as Mock).mockResolvedValue(response)

    const result = await getCustomerHttp({ id: 1 })
    expect(result).toBe(response.data)

    expect(result).toStrictEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          user_id: 1,
          name: 'Leander',
        }),
      }),
    )
    expect(api.get).toHaveBeenCalledWith('/users/1')
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.get as Mock).mockRejectedValueOnce(new Error('API error'))

    await expect(getCustomerHttp({ id: 1 })).rejects.toThrow('API error')

    expect(api.get).toHaveBeenCalledWith('/users/1')
  })
})
