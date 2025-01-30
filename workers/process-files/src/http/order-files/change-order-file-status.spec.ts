import { Mock } from 'vitest'

import { api } from '@/http/api'

import { changeOrderFileStatusHttp } from './change-order-file-status'

vi.mock('@/http/api', () => ({
  api: {
    patch: vi.fn(),
  },
}))

describe('Change Order File Status Http', () => {
  it('should change order file stutus via http', async () => {
    ;(api.patch as Mock).mockResolvedValue(undefined)

    const orderFileId = 1
    const status = 'PROCESSED'
    const error = undefined
    await changeOrderFileStatusHttp({
      orderFileId,
      status,
      error,
    })

    expect(api.patch).toHaveBeenCalledWith(
      `/files/order/${orderFileId}/status`,
      {
        error: undefined,
        status: 'PROCESSED',
      },
    )
  })

  it('should handle errors thrown by the API', async () => {
    ;(api.patch as Mock).mockRejectedValueOnce(new Error('API Error'))

    const orderFileId = 2
    const status = 'PROCESSING_ERROR'

    await expect(
      changeOrderFileStatusHttp({ orderFileId, status }),
    ).rejects.toThrow('API Error')

    expect(api.patch).toHaveBeenCalledWith(
      `/files/order/${orderFileId}/status`,
      {
        status,
        error: undefined,
      },
    )
  })
})
