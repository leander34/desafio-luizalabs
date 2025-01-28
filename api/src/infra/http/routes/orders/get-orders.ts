import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetOrdersController } from '../../controllers/orders/get-orders.controller'
export const getOrdersResquestQueryParamsSchema = z.object({
  start_date: z
    .string({
      invalid_type_error: 'start_date must be string.',
    })
    .nullish()
    .default(null),
  end_date: z
    .string({
      invalid_type_error: 'end_date must be string.',
    })
    .nullish()
    .default(null),
  name: z
    .string({
      invalid_type_error: 'name must be string.',
    })
    .nullish()
    .default(null),
  order_id: z.coerce
    .number({
      invalid_type_error: 'order_id must be an integer.',
    })
    .nullish()
    .default(null),
  user_id: z.coerce
    .number({
      invalid_type_error: 'user_id must be an integer.',
    })
    .nullish()
    .default(null),
  page: z.coerce
    .number({
      invalid_type_error: 'page must be an integer.',
    })
    .nullish()
    .default(null),
  size: z.coerce
    .number({
      invalid_type_error: 'size must be an integer.',
    })
    .nullish()
    .default(null),
})
export const getOrdersResponseSchema = z.object({
  orders: z.array(
    z.object({
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
  ),
})
const controller = new GetOrdersController()
export async function getOrders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Get orders',
        params: getOrdersResquestQueryParamsSchema,
        response: {
          200: getOrdersResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
