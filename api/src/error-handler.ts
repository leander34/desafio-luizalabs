import type { FastifyInstance } from 'fastify'
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod'

import { env } from '@/config/env'

import { normalizeError } from './utlis/normalize-error'
type FastifyErrorHandler = FastifyInstance['errorHandler']

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    const formattedErrors = error.validation.map((err) => {
      const { message, path } = err.params.issue
      return { path: path.join('.'), message }
    })
    return reply.status(400).send({
      message: 'Validation error',
      errors: formattedErrors,
    })
  }

  const normalizedError = normalizeError(error)

  const httpCode = normalizedError.statusCode
  const body = normalizedError.getBody()

  if (env.NODE_ENV === 'production') {
    console.error(error)
  } else {
    console.error(error)
  }

  return reply.status(httpCode).send(body)
}
