import type { FastifyInstance } from 'fastify'

import { changeOrderFileStatusRoute } from './change-order-files-status'
import { getOrderFileRoute } from './get-order-file'
import { uploadOrderFileRoute } from './upload-order-file'

export async function orderFilesRoutes(app: FastifyInstance) {
  app.register(uploadOrderFileRoute)
  app.register(getOrderFileRoute)
  app.register(changeOrderFileStatusRoute)
}
