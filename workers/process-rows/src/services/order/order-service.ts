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
    date,
    externalOrderIdFromFile,
    orderFileId,
    externalCustomerIdFromFile,
  }: FindOrCreateOrderParams): Promise<FindOrCreateOrderReturn> {
    try {
      const orderData = await getOrderHttp({
        externalOrderIdFromFile,
        orderFileId,
        externalCustomerIdFromFile,
      })
      return orderData.order
    } catch (error) {
      if (error instanceof AxiosError && error.status === 404) {
        try {
          const orderData = await createOrderHttp({
            externalOrderIdFromFile,
            date,
            externalCustomerIdFromFile,
            orderFileId,
          })
          return orderData.order
        } catch (error) {
          return null
        }
      }
      return null
    }
  }

  async addOrderProduct({
    externalOrderIdFromFile,
    externalProductIdFromFile,
    externalCustomerIdFromFile,
    orderFileId,
    currentProductValue,
  }: AddOrderProductParams): Promise<OrderProduct | null> {
    try {
      const productCreated = await createOrderProductHttp({
        externalOrderIdFromFile,
        externalProductIdFromFile,
        value: currentProductValue,
        externalCustomerIdFromFile,
        orderFileId,
      })

      return productCreated
    } catch (error) {
      return null
    }
  }
}
