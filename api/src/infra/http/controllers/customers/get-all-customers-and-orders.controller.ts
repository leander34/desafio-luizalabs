import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetAllCustomersAndOrdersUseCase } from '@/application/use-cases/factories/make-get-all-customers-and-orders'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ValidationError } from '@/core/errors/validation-error'
import {
  getAllCustomersAndOrdersResponseSchema,
  getAllCustomersAndOrdersResquestQueryParamsSchema,
} from '@/infra/http/routes/customers/get-all-customers-and-orders'
import { errorFormatter } from '@/utlis/formatters/error-formatter'

import { CustomerWithOrdersPresenter } from '../../presenters/customer-with-orders-presenter'

export class GetAllCustomersAndOrdersController {
  async handler(
    request: FastifyRequest<{
      Querystring: z.infer<
        typeof getAllCustomersAndOrdersResquestQueryParamsSchema
      >
      Reply: z.infer<typeof getAllCustomersAndOrdersResponseSchema>
    }>,
    reply: FastifyReply<{
      Reply: z.infer<typeof getAllCustomersAndOrdersResponseSchema>
    }>,
  ) {
    const queryParams =
      getAllCustomersAndOrdersResquestQueryParamsSchema.safeParse(request.query)
    if (queryParams.error) {
      const formattedErrors = errorFormatter(queryParams.error.errors)
      throw new ValidationError(formattedErrors)
    }
    const useCase = makeGetAllCustomersAndOrdersUseCase()
    const {
      start_date: startDate,
      end_date: endDate,
      order_id: orderId,
      page,
      size,
    } = queryParams.data

    const result = await useCase.execute({
      startDate: startDate ?? null,
      endDate,
      orderId,
      page,
      size,
    })

    if (result.isLeft()) {
      throw new BadRequestError(
        'Unknown error while trying to fetch customer with orders and products.',
        'customers_orders',
      )
    }
    const { customerWithOrders } = result.value
    const customerWithOrdersFormatted = customerWithOrders.map(
      CustomerWithOrdersPresenter.toHttp,
    )
    return reply.status(200).send(customerWithOrdersFormatted)
  }
}
