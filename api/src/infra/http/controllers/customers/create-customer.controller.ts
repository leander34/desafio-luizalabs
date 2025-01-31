import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateCustomerUseCase } from '@/application/use-cases/factories/make-create-customer'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'

import {
  createCustomerRequestBodySchema,
  type createCustomerRequestParamsSchema,
  createCustomerResponseSchema,
} from '../../routes/customers/create-customer'

export class CreateCustomerController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof createCustomerRequestParamsSchema>
      Body: z.infer<typeof createCustomerRequestBodySchema>
      Reply: z.infer<typeof createCustomerResponseSchema>
    }>,
    reply: FastifyReply<{
      Reply: z.infer<typeof createCustomerResponseSchema>
    }>,
  ) {
    const { user_id: externalCustomerIdFromFile, name } = request.body
    const { order_file_id: orderFileId } = request.params
    const useCase = makeCreateCustomerUseCase()
    const result = await useCase.execute({
      orderFileId,
      externalCustomerIdFromFile,
      name,
    })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case BadRequestError:
          throw error
        case ResourceNotFoundError:
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
