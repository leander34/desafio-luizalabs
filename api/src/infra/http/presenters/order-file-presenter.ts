import type { OrderFile } from '@/domain/entities/order-file'

export class OrderFilePresenter {
  static toHttp(orderFile: OrderFile) {
    return {
      order_file_id: orderFile.id.toValue(),
      bucket: orderFile.bucket,
      key: orderFile.key,
      name: orderFile.name,
      status: orderFile.status,
      url: orderFile.url,
      error: orderFile.error,
    }
  }
}
