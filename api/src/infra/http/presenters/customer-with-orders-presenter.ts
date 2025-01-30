import type { CustomerWithOrdersAndProducts } from '@/domain/value-obejcts/customer-with-orders-and-products'

export class CustomerWithOrdersPresenter {
  static toHttp(customerWithOrders: CustomerWithOrdersAndProducts) {
    return {
      user_id: customerWithOrders.id.toValue(),
      name: customerWithOrders.name,
      orders: customerWithOrders.orders.map((order) => ({
        order_id: order.id.toValue(),
        total: order.total.toString(),
        date: order.date,
        products: order.orderProducts.map((orderProduct) => ({
          product_id: orderProduct.productId.toValue(),
          value: orderProduct.value.toString(),
          quantity: orderProduct.quantity,
        })),
      })),
    }
  }
}
