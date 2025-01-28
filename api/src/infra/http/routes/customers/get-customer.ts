import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetCustomerController } from '../../controllers/customers/get-customer.controller'
export const getCustomerRequestParamsSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be an integer.',
  }),
})
export const getCustomerResponseSchema = z.object({
  user: z.object({
    user_id: z.number(),
    name: z.string(),
  }),
})
const controller = new GetCustomerController()
export async function getCustomer(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Get a customer',
        params: getCustomerRequestParamsSchema,
        response: {
          200: getCustomerResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
