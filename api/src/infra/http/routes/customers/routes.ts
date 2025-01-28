import type { FastifyInstance } from 'fastify'

import { createCustomer } from './create-customer'
import { getCustomer } from './get-customer'

export async function customersRoutes(app: FastifyInstance) {
  app.register(createCustomer)
  app.register(getCustomer)
}
