import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateOrderUseCase } from '@/application/use-cases/factories/make-create-order'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import {
  createOrderRequestBodySchema,
  createOrderRequestParamsSchema,
  createOrderResponseSchema,
} from '../../routes/orders/create-order'

export class CreateOrderController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof createOrderRequestParamsSchema>
      Body: z.infer<typeof createOrderRequestBodySchema>
      Reply: z.infer<typeof createOrderResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof createOrderResponseSchema> }>,
  ) {
    const { order_id: externalOrderIdFromFile, date } = request.body

    const {
      order_file_id: orderFileId,
      external_user_id_from_file: externalCustomerIdFromFile,
    } = request.params

    const useCase = makeCreateOrderUseCase()
    const result = await useCase.execute({
      orderFileId,
      externalCustomerIdFromFile,
      externalOrderIdFromFile,
      date,
    })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        case BadRequestError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to create order.',
            'order',
          )
      }
    }
    return reply.status(201).send()
  }
}
