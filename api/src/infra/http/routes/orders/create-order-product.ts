import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { CreateOrderProductController } from '../../controllers/orders/create-order-product.controller'
export const createOrderProductRequestParamsSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be an integer.',
  }),
})

export const createOrderProductRequestBodySchema = z.object({
  product_id: z.coerce.number({
    required_error: 'product_id is required.',
    invalid_type_error: 'product_id must be an integer.',
  }),
  value: z
    .number({
      invalid_type_error: 'value must be number.',
      required_error: 'value is required.',
    })
    .positive({ message: 'value must be posiive.' }),
})

export const createOrderProductResponseSchema = z.null()
const controller = new CreateOrderProductController()
export async function createOrderProduct(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/:id/products',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Create an order product',
        params: createOrderProductRequestParamsSchema,
        body: createOrderProductRequestBodySchema,
        response: {
          201: createOrderProductResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
