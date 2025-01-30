import type { FastifyInstance } from 'fastify'

import { createCustomer } from './create-customer'
import { getAllCustomersAndOrders } from './get-all-customers-and-orders'
import { getCustomer } from './get-customer'

export async function customersRoutes(app: FastifyInstance) {
  app.register(createCustomer)
  app.register(getAllCustomersAndOrders)
  app.register(getCustomer)
}
