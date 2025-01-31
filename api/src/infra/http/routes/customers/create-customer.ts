import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreateCustomerController } from '../../controllers/customers/create-customer.controller'
export const createCustomerRequestBodySchema = z.object({
  user_id: z.coerce
    .number({
      invalid_type_error: 'user_id must be an integer.',
    })
    .describe(
      'Id do usuário naquele arquivo, dentro do sistema vira externalCustomerIdFromFile',
    ),
  name: z.string({
    required_error: 'name is required.',
    invalid_type_error: 'name must be string.',
  }),
})
export const createCustomerRequestParamsSchema = z.object({
  order_file_id: z.coerce.number({
    invalid_type_error: 'order_file_id must be an integer.',
  }),
})

export const createCustomerResponseSchema = z.null()
const controller = new CreateCustomerController()
export async function createCustomer(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/files/:order_file_id/users',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Create a customer',
        params: createCustomerRequestParamsSchema,
        body: createCustomerRequestBodySchema,
        response: {
          201: createCustomerResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
