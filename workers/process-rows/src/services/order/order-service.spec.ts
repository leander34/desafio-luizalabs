import { AxiosError } from 'axios'
import type { Mock } from 'vitest'

import { createOrderHttp } from '@/http/orders/create-order'
import { createOrderProductHttp } from '@/http/orders/create-order-product'
import { getOrderHttp } from '@/http/orders/get-order'

import { OrderService } from './order-service'

vi.mock('@/http/orders/get-order', () => ({
  getOrderHttp: vi.fn(),
}))

vi.mock('@/http/orders/create-order', () => ({
  createOrderHttp: vi.fn(),
}))

vi.mock('@/http/orders/create-order-product', () => ({
  createOrderProductHttp: vi.fn(),
}))

vi.mock('@/http/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Order Service', () => {
  it('should be able to get a order by id', async () => {
    const response = {
      order: {
        order_id: 1,
        date: '2021-01-24',
        total: 0,
        products: [],
      },
    }
    const orderService = new OrderService()
    ;(getOrderHttp as Mock).mockResolvedValue(response)

    const result = await orderService.findOrCreateOrder({
      customerId: 1,
      date: '2021-01-01',
      orderId: 1,
    })

    expect(result).toBe(response.order)
    expect(getOrderHttp).toHaveBeenCalledTimes(1)
  })

  it('should return null when unable to get the customer with a generic error', async () => {
    const orderService = new OrderService()
    ;(getOrderHttp as Mock).mockRejectedValue(new Error('API error'))

    const result = await orderService.findOrCreateOrder({
      customerId: 1,
      date: '2021-10-10',
      orderId: 1,
    })
    expect(result).toBe(null)
    expect(getOrderHttp).toHaveBeenCalledTimes(1)
  })
  it('must be able to try to search for a customer by id and if it does not exist it must create it', async () => {
    const response = {
      order: {
        order_id: 1,
        date: '2022-01-10',
        total: 0,
        products: [],
      },
    }
    const orderService = new OrderService()
    ;(getOrderHttp as Mock).mockRejectedValue(
      new AxiosError(
        'Axios Error',
        '404',
        {} as any,
        {} as any,
        { status: 404 } as any,
      ),
    )
    ;(createOrderHttp as Mock).mockResolvedValue(response)

    const result = await orderService.findOrCreateOrder({
      customerId: 1,
      date: '2022-01-10',
      orderId: 1,
    })
    expect(result?.order_id).toBe(response.order.order_id)
    expect(result?.date).toBe(response.order.date)
    expect(result?.total).toBe(response.order.total)
    expect(getOrderHttp).toHaveBeenCalledTimes(1)
    expect(createOrderHttp).toHaveBeenCalledTimes(1)
  })
  it('should return null if unable to create customer', async () => {
    const orderService = new OrderService()
    ;(getOrderHttp as Mock).mockRejectedValue(
      new AxiosError(
        'Axios Error',
        '404',
        {} as any,
        {} as any,
        { status: 404 } as any,
      ),
    )
    ;(createOrderHttp as Mock).mockRejectedValue(undefined)

    const result = await orderService.findOrCreateOrder({
      customerId: 1,
      date: '2022-01-10',
      orderId: 1,
    })
    expect(result).toBe(null)
    expect(getOrderHttp).toHaveBeenCalledTimes(1)
    expect(createOrderHttp).toHaveBeenCalledTimes(1)
  })

  it('should be able to create a order product', async () => {
    const response = {
      product_id: 100,
      value: 100,
      quantity: 1,
    }
    const orderService = new OrderService()
    ;(createOrderProductHttp as Mock).mockResolvedValue(response)

    const result = await orderService.addOrderProduct({
      currentProductValue: 100,
      orderId: 100,
      productId: 100,
    })
    expect(result?.product_id).toBe(response.product_id)
    expect(result?.quantity).toBe(response.quantity)
    expect(result?.value).toBe(response.value)
    expect(createOrderProductHttp).toHaveBeenCalledTimes(1)
  })

  it('should return null if unable to create client', async () => {
    const orderService = new OrderService()
    ;(createOrderProductHttp as Mock).mockRejectedValue(undefined)

    const result = await orderService.addOrderProduct({
      currentProductValue: 100,
      orderId: 100,
      productId: 100,
    })

    expect(result).toBe(null)
    expect(createOrderProductHttp).toHaveBeenCalledTimes(1)
  })
})
