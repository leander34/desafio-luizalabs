import type { OrderWithProducts } from '@/domain/value-obejcts/order-with-products'

export class OrderWithProductPresenter {
  static toHttp(orderWithProducts: OrderWithProducts) {
    return {
      order_id: orderWithProducts.id.toValue(),
      date: orderWithProducts.date,
      total: orderWithProducts.total,
      products: orderWithProducts.orderProducts.map((item) => ({
        product_id: item.productId.toValue(),
        value: item.value,
        quantity: item.quantity,
      })),
    }
  }
}
