import { OrderFileStatus } from '@prisma/client'
import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { ChangeOrderFileStatusController } from '../../controllers/order-files/change-order-file-status.controller'
export const changeOrderFileStatusRequestParamsSchema = z.object({
  id: z.coerce.number({
    invalid_type_error: 'id must be an integer.',
  }),
})

export const changeOrderFileStatusRequestBodySchema = z.object({
  status: z.nativeEnum(OrderFileStatus, {
    required_error: 'status is required.',
  }),
  error: z.string({ invalid_type_error: 'error must be string.' }).optional(),
})

export const changeOrderFileStatusResponseSchema = z.null()
const controller = new ChangeOrderFileStatusController()
export async function changeOrderFileStatusRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/files/order/:id/status',
    {
      schema: {
        tags: ['Order Files'],
        summary: 'Change order file status',
        params: changeOrderFileStatusRequestParamsSchema,
        response: {
          204: changeOrderFileStatusResponseSchema,
        },
      },
    },
    controller.handler,
  )
}
