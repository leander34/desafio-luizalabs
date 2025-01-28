import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetOrderController } from '../../controllers/orders/get-order.controller'
export const getOrderResquestParamsSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be an integer.',
  }),
})
export const getOrderResponseSchema = z.object({
  order: z.object({
    order_id: z.number(),
    date: z.string(),
    total: z.number(),
    products: z.array(
      z.object({
        product_id: z.number(),
        value: z.number(),
        quantity: z.number(),
      }),
    ),
  }),
})
const controller = new GetOrderController()
export async function getOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/:id',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Get an order',
        params: getOrderResquestParamsSchema,
        response: {
          200: getOrderResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
