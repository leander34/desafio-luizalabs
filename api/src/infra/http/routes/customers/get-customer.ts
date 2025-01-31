import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetCustomerController } from '../../controllers/customers/get-customer.controller'
export const getCustomerRequestParamsSchema = z.object({
  order_file_id: z.coerce.number({
    invalid_type_error: 'order_file_id must be an integer.',
  }),
  external_user_id_from_file: z.coerce.number({
    invalid_type_error: 'external_user_id_from_file must be an integer.',
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
    '/files/:order_file_id/users/:external_user_id_from_file',
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
