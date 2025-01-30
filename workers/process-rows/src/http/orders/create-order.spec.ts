import { Mock } from 'vitest'

import { api } from '@/http/api'

import { createOrderHttp } from './create-order'

vi.mock('@/http/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('Create Order Htpp', () => {
  it('should create a order via http', async () => {
    ;(api.post as Mock).mockResolvedValue(undefined)
    const order = { customerId: 1, date: '2024-10-10', orderId: 1 }

    const result = await createOrderHttp({
      customerId: order.customerId,
      date: order.date,
      orderId: order.orderId,
    })
    expect(result.order.order_id).toBe(order.customerId)
    expect(result.order.total).toBe(0)
    expect(result.order.date).toBe(order.date)

    expect(api.post).toHaveBeenCalledWith(`/orders`, {
      order_id: order.orderId,
      user_id: order.customerId,
      date: order.date,
    })
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.post as Mock).mockRejectedValueOnce(new Error('API error'))

    const order = { customerId: 1, date: '2024-10-10', orderId: 1 }

    await expect(
      createOrderHttp({
        customerId: order.customerId,
        date: order.date,
        orderId: order.orderId,
      }),
    ).rejects.toThrow('API error')

    expect(api.post).toHaveBeenCalledWith(`/orders`, {
      order_id: order.orderId,
      user_id: order.customerId,
      date: order.date,
    })
  })
})
