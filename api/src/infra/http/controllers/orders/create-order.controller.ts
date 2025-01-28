import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateOrderUseCase } from '@/application/use-cases/factories/make-create-order'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import type {
  createOrderRequestBodySchema,
  createOrderResponseSchema,
} from '../../routes/orders/create-order'

export class CreateOrderController {
  async handler(
    request: FastifyRequest<{
      Body: z.infer<typeof createOrderRequestBodySchema>
      Reply: z.infer<typeof createOrderResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof createOrderResponseSchema> }>,
  ) {
    const { order_id: orderId, user_id: customerId, date } = request.body

    const useCase = makeCreateOrderUseCase()
    const result = await useCase.execute({
      orderId: orderId ?? null,
      customerId,
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
