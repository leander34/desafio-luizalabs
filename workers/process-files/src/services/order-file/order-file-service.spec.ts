import type { Mock } from 'vitest'

import { changeOrderFileStatusHttp } from '@/http/order-files/change-order-file-status'
import { getOrderFileHttp } from '@/http/order-files/get-order-file'

import { OrderFileService } from './order-file-service'

vi.mock('@/http/order-files/get-order-file', () => ({
  getOrderFileHttp: vi.fn(),
}))

vi.mock('@/http/order-files/change-order-file-status', () => ({
  changeOrderFileStatusHttp: vi.fn(),
}))

describe('Order File Service', () => {
  it('should fetch and return order file data', async () => {
    const orderFileService = new OrderFileService()
    const response = {
      order_file: {
        order_file_id: 1,
        bucket: 'my-bucket',
        key: 'my-file.txt',
        name: 'my-file',
        status: 'PROCESSING',
        url: 'url',
        error: null,
      },
    }
    ;(getOrderFileHttp as Mock).mockResolvedValue(response)
    const result = await orderFileService.getOrderFile({ orderFileId: 1 })
    expect(result).toHaveProperty('order_file')
    expect(result).toBe(response)
    expect(getOrderFileHttp).toHaveBeenCalledOnce()
  })
  it('should change order file status', async () => {
    const orderFileService = new OrderFileService()
    ;(changeOrderFileStatusHttp as Mock).mockResolvedValue(undefined)

    const result = await orderFileService.changeOrderFileStatus({
      orderFileId: 1,
      status: 'PROCESSED',
    })
    expect(result).toBe(undefined)
    await expect(
      changeOrderFileStatusHttp({
        orderFileId: 1,
        status: 'PROCESSED',
      }),
    ).resolves.toBe(undefined)
  })
  it('should handle errors thrown by the API when try to change order file status', () => {})
})
