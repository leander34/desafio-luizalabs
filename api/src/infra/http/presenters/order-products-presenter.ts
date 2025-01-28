import type { OrderProduct } from '@/domain/entities/order-product'

export class OrderProductPresenter {
  static toHttp(orderProduct: OrderProduct) {
    return {
      order_product_id: orderProduct.id.toValue(),
      order_id: orderProduct.orderId,
      product_id: orderProduct.productId,
      quantity: orderProduct.quantity,
      value: orderProduct.value,
    }
  }
}
