import {
  changeOrderFileStatusHttp,
  type ChangeOrderFileStatusHttpRequest,
} from '@/http/order-files/change-order-file-status'
import {
  getOrderFileHttp,
  type GetOrderFileHttpRequest,
} from '@/http/order-files/get-order-file'

import type { IOrderFileService } from './interface'
export class OrderFileService implements IOrderFileService {
  async getOrderFile({ orderFileId }: GetOrderFileHttpRequest) {
    return await getOrderFileHttp({ orderFileId })
  }

  async changeOrderFileStatus({
    orderFileId,
    status,
    error,
  }: ChangeOrderFileStatusHttpRequest) {
    await changeOrderFileStatusHttp({ orderFileId, status, error })
  }
}
