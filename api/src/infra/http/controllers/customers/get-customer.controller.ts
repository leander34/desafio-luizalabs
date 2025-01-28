import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeGetCustomerUseCase } from '@/application/use-cases/factories/make-get-customer'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import { CustomerPresenter } from '../../presenters/customer-presenter'
import {
  getCustomerRequestParamsSchema,
  getCustomerResponseSchema,
} from '../../routes/customers/get-customer'

export class GetCustomerController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof getCustomerRequestParamsSchema>
      Reply: z.infer<typeof getCustomerResponseSchema>
    }>,
    reply: FastifyReply<{ Reply: z.infer<typeof getCustomerResponseSchema> }>,
  ) {
    const { id } = request.params
    const useCase = makeGetCustomerUseCase()
    const result = await useCase.execute({ customerId: id })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to fetch user.',
            'user',
          )
      }
    }
    const { customer } = result.value
    return reply.status(200).send({
      user: CustomerPresenter.toHttp(customer),
    })
  }
}
