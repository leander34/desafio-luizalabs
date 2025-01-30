import { Mock } from 'vitest'

import { api } from '@/http/api'

import { getOrderHttp } from './get-order'

vi.mock('@/http/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('Get Order Http', () => {
  it('should fetch and return order data', async () => {
    const response = {
      data: {
        order: {
          order_id: 1,
          date: '2024-10-10',
          total: 0,
          products: [
            {
              product_id: 1,
              value: 100,
              quantity: 1,
            },
          ],
        },
      },
    }
    ;(api.get as Mock).mockResolvedValue(response)
    const order = { customerId: 1, orderId: 1 }

    const result = await getOrderHttp({
      customerId: order.customerId,
      orderId: order.orderId,
    })
    expect(result).toStrictEqual(response.data)

    expect(api.get).toHaveBeenCalledWith('/orders/1')
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.get as Mock).mockRejectedValueOnce(new Error('API error'))
    const order = { customerId: 1, orderId: 1 }

    await expect(
      getOrderHttp({ customerId: order.customerId, orderId: order.orderId }),
    ).rejects.toThrow('API error')
    expect(api.get).toHaveBeenCalledWith('/orders/1')
  })
})
