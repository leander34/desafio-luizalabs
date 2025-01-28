import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetOrderUseCase } from '@/application/use-cases/factories/make-get-order'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { OrderWithProductPresenter } from '../../presenters/order-with-products-presenter'
import type {
  getOrderResponseSchema,
  getOrderResquestParamsSchema,
} from '../../routes/orders/get-order'

export class GetOrderController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof getOrderResquestParamsSchema>
      Reply: z.infer<typeof getOrderResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof getOrderResponseSchema> }>,
  ) {
    const { id } = request.params
    const useCase = makeGetOrderUseCase()
    const result = await useCase.execute({ orderId: id })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to fetch order.',
            'order',
          )
      }
    }
    const { order } = result.value
    return reply.status(200).send({
      order: OrderWithProductPresenter.toHttp(order),
    })
  }
}
