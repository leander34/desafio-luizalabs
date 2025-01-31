import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetOrderController } from '../../controllers/orders/get-order.controller'
export const getOrderRequestParamsSchema = z.object({
  order_file_id: z.coerce.number({
    invalid_type_error: 'order_file_id must be an integer.',
  }),
  external_user_id_from_file: z.coerce.number({
    invalid_type_error: 'external_user_id_from_file must be an integer.',
  }),
  external_order_id_from_file: z.coerce.number({
    invalid_type_error: 'external_order_id_from_file must be an integer.',
  }),
})
export const getOrderResponseSchema = z.object({
  order: z.object({
    order_id: z.number(),
    date: z.string(),
    total: z.number(),
  }),
})
const controller = new GetOrderController()
export async function getOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/files/:order_file_id/users/:external_user_id_from_file/orders/:external_order_id_from_file',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Get an order',
        params: getOrderRequestParamsSchema,
        response: {
          200: getOrderResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
