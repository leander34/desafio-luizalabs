import { OrderFileStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { GetOrderFileController } from '@/infra/http/controllers/order-files/get-order-file.controller'
export const getOrderFileRequestParamsSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be an integer.',
  }),
})

export const getOrderFileResponseSchema = z.object({
  order_file: z.object({
    order_file_id: z.number(),
    bucket: z.string(),
    status: z.nativeEnum(OrderFileStatus),
    name: z.string(),
    key: z.string(),
    url: z.string(),
    error: z.string().nullish(),
  }),
})
const controller = new GetOrderFileController()
export async function getOrderFileRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/files/order/:id',
    {
      schema: {
        tags: ['Order Files'],
        summary: 'Get order file',
        params: getOrderFileRequestParamsSchema,
        response: {
          200: getOrderFileResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
