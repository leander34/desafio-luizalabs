import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCustomerUseCase } from '@/application/use-cases/factories/make-create-customer'
import { BadRequestError } from '@/core/errors/bad-request-error'

import {
  createCustomerRequestBodySchema,
  createCustomerResponseSchema,
} from '../../routes/customers/create-customer'

export class CreateCustomerController {
  async handler(
    request: FastifyRequest<{
      Body: z.infer<typeof createCustomerRequestBodySchema>
      Reply: z.infer<typeof createCustomerResponseSchema>
    }>,
    reply: FastifyReply<{
      Reply: z.infer<typeof createCustomerResponseSchema>
    }>,
  ) {
    const { user_id: customerId, name } = request.body
    const useCase = makeCreateCustomerUseCase()
    const result = await useCase.execute({
      customerId: customerId ?? null,
      name,
    })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case BadRequestError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to create user.',
            'user',
          )
      }
    }
    return reply.status(201).send()
  }
}
