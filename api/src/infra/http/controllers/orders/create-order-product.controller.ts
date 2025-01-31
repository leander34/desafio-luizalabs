import type { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

import { makeCreateOrderProductUseCase } from '@/application/use-cases/factories/make-create-order-product'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import {
  createOrderProductRequestBodySchema,
  createOrderProductRequestParamsSchema,
  createOrderProductResponseSchema,
} from '@/infra/http/routes/orders/create-order-product'
export class CreateOrderProductController {
  async handler(
    request: FastifyRequest<{
      Params: z.infer<typeof createOrderProductRequestParamsSchema>
      Body: z.infer<typeof createOrderProductRequestBodySchema>
      Reply: z.infer<typeof createOrderProductResponseSchema>
    }>,
    reply: FastifyReply<{
      Reply: z.infer<typeof createOrderProductResponseSchema>
    }>,
  ) {
    const { product_id: externalProductIdFromFile, value } = request.body
    const {
      order_file_id: orderFileId,
      external_user_id_from_file: externalCustomerIdFromFile,
      external_order_id_from_file: externalOrderIdFromFile,
    } = request.params

    const useCase = makeCreateOrderProductUseCase()
    const result = await useCase.execute({
      orderFileId,
      externalCustomerIdFromFile,
      externalOrderIdFromFile,
      externalProductIdFromFile,
      value,
    })
    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error when trying to add product to order.',
            'order',
          )
      }
    }
    return reply.status(201).send()
  }
}
