import type { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { UploadOrderFileController } from '@/infra/http/controllers/order-files/upload-order-file.controller'

const controller = new UploadOrderFileController()
export async function uploadOrderFileRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/files/order',
    {
      schema: {
        tags: ['Files'],
        summary: 'Upload order file',
        response: {
          201: z.null(),
        },
      },
    },
    controller.handler,
  )
}
