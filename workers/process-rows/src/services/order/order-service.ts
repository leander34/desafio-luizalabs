import { AxiosError } from 'axios'

import { createOrderHttp } from '@/http/orders/create-order'
import { createOrderProductHttp } from '@/http/orders/create-order-product'
import { getOrderHttp } from '@/http/orders/get-order'
import type { OrderProduct } from '@/types/order-product'

import type {
  AddOrderProductParams,
  FindOrCreateOrderParams,
  FindOrCreateOrderReturn,
} from './interface'
export class OrderService {
  async findOrCreateOrder({
    customerId,
    date,
    orderId,
  }: FindOrCreateOrderParams): Promise<FindOrCreateOrderReturn> {
    try {
      const orderData = await getOrderHttp({ orderId, customerId })
      return orderData.order
    } catch (error) {
      if (error instanceof AxiosError && error.status === 404) {
        try {
          const orderData = await createOrderHttp({ orderId, date, customerId })
          return orderData.order
        } catch (error) {
          return null
        }
      }
      return null
    }
  }

  async addOrderProduct({
    currentProductValue,
    orderId,
    productId,
  }: AddOrderProductParams): Promise<OrderProduct | null> {
    try {
      const productCreated = await createOrderProductHttp({
        orderId,
        productId,
        value: currentProductValue,
      })

      return productCreated
    } catch (error) {
      return null
    }
  }
}
