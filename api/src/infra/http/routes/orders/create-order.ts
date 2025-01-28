import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { dateValidator } from '@/utlis/validators/date-validator'

import { CreateOrderController } from '../../controllers/orders/create-order.controller'

export const createOrderRequestBodySchema = z.object({
  order_id: z.coerce
    .number({ invalid_type_error: 'order_id must be an integer.' })
    .optional(),
  user_id: z.coerce.number({
    invalid_type_error: 'user_id must be an integer.',
    required_error: 'user_id is required',
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
export const createOrderResponseSchema = z.null()
const controller = new CreateOrderController()
export async function createOrder(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/',
    {
      schema: {
        tags: ['Orders'],
        summary: 'Create an order',
        body: createOrderRequestBodySchema,
        response: {
          201: createOrderResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
