import type { FastifyInstance } from 'fastify'

import { createOrder } from './create-order'
import { createOrderProduct } from './create-order-product'
import { getOrder } from './get-order'
import { getOrders } from './get-orders'

export async function ordersRoutes(app: FastifyInstance) {
  app.register(createOrder)
  app.register(getOrder)
  app.register(getOrders)
  app.register(createOrderProduct)
}
