import type { ChangeOrderFileStatusHttpRequest } from '@/http/order-files/change-order-file-status'
import type {
  GetOrderFileHttpRequest,
  GetOrderFileHttpResponse,
} from '@/http/order-files/get-order-file'

export interface IOrderFileService {
  getOrderFile(
    params: GetOrderFileHttpRequest,
  ): Promise<GetOrderFileHttpResponse>
  changeOrderFileStatus(params: ChangeOrderFileStatusHttpRequest): Promise<void>
}
