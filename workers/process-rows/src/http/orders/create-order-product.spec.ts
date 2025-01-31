import { Mock } from 'vitest'

import { api } from '@/http/api'

import { createOrderProductHttp } from './create-order-product'

vi.mock('@/http/api', () => ({
  api: {
    post: vi.fn(),
  },
}))

describe('Create Order Product Htpp', () => {
  it('should create a order product via http', async () => {
    ;(api.post as Mock).mockResolvedValue(undefined)
    const orderProduct = { orderId: 1, productId: 1, value: 10, customerId: 1 }
    const orderFileId = 1
    const result = await createOrderProductHttp({
      externalOrderIdFromFile: orderProduct.orderId,
      externalProductIdFromFile: orderProduct.productId,
      value: orderProduct.value,
      externalCustomerIdFromFile: orderProduct.customerId,
      orderFileId,
    })

    expect(result.product_id).toBe(orderProduct.productId)
    expect(result.quantity).toBe(1)
    expect(result.value).toBe(orderProduct.value)

    expect(api.post).toHaveBeenCalledWith(
      `/files/${orderFileId}/users/${orderProduct.customerId}/orders/${orderProduct.orderId}/products`,
      {
        product_id: orderProduct.productId,
        value: orderProduct.value,
      },
    )
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.post as Mock).mockRejectedValueOnce(new Error('API error'))
    const orderProduct = { orderId: 1, productId: 1, value: 10, customerId: 1 }
    const orderFileId = 1

    await expect(
      createOrderProductHttp({
        externalOrderIdFromFile: orderProduct.orderId,
        externalProductIdFromFile: orderProduct.productId,
        value: orderProduct.value,
        externalCustomerIdFromFile: orderProduct.customerId,
        orderFileId,
      }),
    ).rejects.toThrow('API error')

    expect(api.post).toHaveBeenCalledWith(
      `/files/${orderFileId}/users/${orderProduct.customerId}/orders/${orderProduct.orderId}/products`,
      {
        product_id: orderProduct.productId,
        value: orderProduct.value,
      },
    )
  })
})
