import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { dateValidator } from '@/utlis/validators/date-validator'

import { CreateOrderController } from '../../controllers/orders/create-order.controller'

export const createOrderRequestBodySchema = z.object({
  order_id: z.coerce.number({
    invalid_type_error: 'order_id must be an integer.',
  }),
  date: z
    .string({
      required_error: 'date is required.',
      invalid_type_error: 'date must be string.',
    })
    .refine((value) => dateValidator(value), {
      message: 'Invalid date format, try: YYYY-MM-DD',
    })
    .transform((value) => dayjs(value).format('YYYY-MM-DD')),
})

export const createOrderRequestParamsSchema = z.object({
  order_file_id: z.coerce.number({
    invalid_type_error: 'order_file_id must be an integer.',
  }),
  external_user_id_from_file: z.coerce.number({
    invalid_type_error: 'external_user_id_from_file must be an integer.',
  }),
})
export const createOrderResponseSchema = z.null()
const controller = new CreateOrderController()
export async function createOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/files/:order_file_id/users/:external_user_id_from_file/orders',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Create an order',
        params: createOrderRequestParamsSchema,
        body: createOrderRequestBodySchema,
        response: {
          201: createOrderResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
