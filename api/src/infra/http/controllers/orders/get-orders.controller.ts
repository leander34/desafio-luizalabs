import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetOrdersUseCase } from '@/application/use-cases/factories/make-get-orders'
import { BadRequestError } from '@/core/errors/bad-request-error'

import { OrderWithProductPresenter } from '../../presenters/order-with-products-presenter'
import type {
  getOrdersResponseSchema,
  getOrdersResquestQueryParamsSchema,
} from '../../routes/orders/get-orders'

export class GetOrdersController {
  async handler(
    request: FastifyRequest<{
      Querystring: z.infer<typeof getOrdersResquestQueryParamsSchema>
      Reply: z.infer<typeof getOrdersResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof getOrdersResponseSchema> }>,
  ) {
    const {
      start_date: startDate,
      end_date: endDate,
      name,
      order_id: orderId,
      user_id: customerId,
      page,
      size,
    } = request.query
    const useCase = makeGetOrdersUseCase()
    const result = await useCase.execute({
      startDate,
      endDate,
      name,
      orderId,
      customerId,
      page,
      size,
    })
    if (result.isLeft()) {
      throw new BadRequestError(
        'Unknown error while trying to fetch orders.',
        'orders',
      )
    }
    const { orders } = result.value
    return reply.status(200).send({
      orders: orders.map(OrderWithProductPresenter.toHttp),
    })
  }
}
