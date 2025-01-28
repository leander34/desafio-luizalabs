import { AxiosError } from 'axios'

import { createOrderHttp } from '@/http/orders/create-order'
import { getOrderHttp } from '@/http/orders/get-order'

interface FindOrCreateOrderParams {
  customerId: number
  orderId: number
  date: string
}

export async function findOrCreateOrder({
  orderId,
  date,
  customerId,
}: FindOrCreateOrderParams) {
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
