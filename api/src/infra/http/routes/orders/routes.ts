import type { FastifyInstance } from 'fastify'

import { createOrder } from './create-order'
import { createOrderProduct } from './create-order-product'
import { getOrder } from './get-order'

export async function ordersRoutes(app: FastifyInstance) {
  app.register(createOrder)
  app.register(getOrder)
  app.register(createOrderProduct)
}
