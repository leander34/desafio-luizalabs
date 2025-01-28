import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeChangeOrderFileStatusUseCase } from '@/application/use-cases/factories/make-change-order-file-status'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type {
  changeOrderFileStatusRequestBodySchema,
  changeOrderFileStatusRequestParamsSchema,
  changeOrderFileStatusResponseSchema,
} from '../../routes/order-files/change-order-files-status'

export class ChangeOrderFileStatusController {
  async handler(
    request: FastifyRequest<{
      Body: z.infer<typeof changeOrderFileStatusRequestBodySchema>
      Params: z.infer<typeof changeOrderFileStatusRequestParamsSchema>
      Reply: z.infer<typeof changeOrderFileStatusResponseSchema>
    }>,
    reply: FastifyReply<{
      Reply: z.infer<typeof changeOrderFileStatusResponseSchema>
    }>,
  ) {
    const { id } = request.params
    const { status, error } = request.body

    const useCase = makeChangeOrderFileStatusUseCase()
    const result = await useCase.execute({ orderFileId: id, status, error })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        case BadRequestError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to fetch order file.',
            'order_file',
          )
      }
    }

    return reply.status(204).send()
  }
}
