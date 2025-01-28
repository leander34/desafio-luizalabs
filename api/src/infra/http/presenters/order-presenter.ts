import type { Order } from '@/domain/entities/order'

export class OrderPresenter {
  static toHttp(order: Order) {
    return {
      order_id: order.id.toValue(),
      total: order.total,
      date: order.date,
    }
  }
}
