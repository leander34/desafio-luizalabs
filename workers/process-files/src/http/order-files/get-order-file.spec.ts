import { Mock } from 'vitest'

import { api } from '@/http/api'

import { getOrderFileHttp } from './get-order-file'

vi.mock('@/http/api', () => ({
  api: {
    get: vi.fn(),
  },
}))

describe('Get Order File Http', () => {
  it('should fetch and return order file data', async () => {
    const response = {
      data: {
        order_file: {
          order_file_id: 1,
          bucket: 'my-bucket',
          key: 'my-file.txt',
          name: 'my-file',
          status: 'PROCESSING',
          url: 'url',
          error: null,
        },
      },
    }
    ;(api.get as Mock).mockResolvedValue(response)

    const result = await getOrderFileHttp({ orderFileId: 1 })
    expect(result).toBe(response.data)

    expect(result).toStrictEqual(
      expect.objectContaining({
        order_file: expect.objectContaining({
          order_file_id: 1,
          bucket: 'my-bucket',
          key: 'my-file.txt',
          name: 'my-file',
          status: 'PROCESSING',
          url: 'url',
          error: null,
        }),
      }),
    )
    expect(api.get).toHaveBeenCalledWith('/files/order/1')
  })

  it('should throw an error if the API request fails', async () => {
    ;(api.get as Mock).mockRejectedValueOnce(new Error('API error'))

    await expect(getOrderFileHttp({ orderFileId: 1 })).rejects.toThrow(
      'API error',
    )

    expect(api.get).toHaveBeenCalledWith('/files/order/1')
  })
})
