import dayjs from 'dayjs'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { dateValidator } from '@/utlis/validators/date-validator'

import { GetAllCustomersAndOrdersController } from '../../controllers/customers/get-all-customers-and-orders.controller'

export const getAllCustomersAndOrdersResquestQueryParamsSchema = z.object({
  start_date: z
    .string({
      invalid_type_error: 'start_date must be string.',
    })
    .refine((value) => dateValidator(value), {
      message: 'Invalid date format, try: YYYY-MM-DD',
    })
    .transform((value) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD')
      }
      return value
    })
    .nullish()
    .default(null),
  end_date: z
    .string({
      invalid_type_error: 'end_date must be string.',
    })
    .refine((value) => dateValidator(value), {
      message: 'Invalid date format, try: YYYY-MM-DD',
    })
    .transform((value) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD')
      }
      return value
    })
    .nullish()
    .default(null),
  order_id: z.coerce
    .number({
      invalid_type_error: 'order_id must be an integer.',
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
    .min(1)
    .max(500)
    .nullish()
    .default(500),
})

export const getAllCustomersAndOrdersResponseSchema = z.array(
  z.object({
    user_id: z.number(),
    name: z.string(),
    orders: z.array(
      z.object({
        order_id: z.number(),
        total: z.string(),
        date: z.string(),
        products: z.array(
          z.object({
            product_id: z.number(),
            value: z.string(),
            quantity: z.number(),
          }),
        ),
      }),
    ),
  }),
)
const controller = new GetAllCustomersAndOrdersController()
export async function getAllCustomersAndOrders(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/users/orders',
    {
      schema: {
        tags: ['Customers'],
        summary: 'Get all customer with orders',
        params: getAllCustomersAndOrdersResquestQueryParamsSchema,
        response: {
          200: getAllCustomersAndOrdersResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
