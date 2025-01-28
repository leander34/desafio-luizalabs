import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetOrderFileUseCase } from '@/application/use-cases/factories/make-get-order-file'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { OrderFilePresenter } from '../../presenters/order-file-presenter'
import type {
  getOrderFileRequestParamsSchema,
  getOrderFileResponseSchema,
} from '../../routes/order-files/get-order-file'

export class GetOrderFileController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof getOrderFileRequestParamsSchema>
      Reply: z.infer<typeof getOrderFileResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof getOrderFileResponseSchema> }>,
  ) {
    const { id } = request.params

    const useCase = makeGetOrderFileUseCase()
    const result = await useCase.execute({ orderFileId: id })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to fetch order file.',
            'order_file',
          )
      }
    }

    const { orderFile } = result.value
    return reply
      .status(200)
      .send({ order_file: OrderFilePresenter.toHttp(orderFile) })
  }
}
