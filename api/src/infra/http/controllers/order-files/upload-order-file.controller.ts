import type { FastifyReply, FastifyRequest } from 'fastify'

import { makeUploadOrderFileUseCase } from '@/application/use-cases/factories/make-upload-order-file'
import { env } from '@/config/env'
import { BadRequestError } from '@/core/errors/bad-request-error'
import { InvalidFileTypeError } from '@/core/errors/invalid-file-type-error'
export class UploadOrderFileController {
  async handler(request: FastifyRequest, reply: FastifyReply) {
    if (!request.isMultipart()) {
      throw new BadRequestError(
        'A requisição não é multipart/form-data',
        'file',
      )
    }
    const uploadedFile = await request.file({
      limits: {
        fileSize: 10_485_760, // 10mb
      },
    })

    if (!uploadedFile) {
      throw new BadRequestError('File not sent.', 'file')
    }

    const stream = uploadedFile.file
    const mimetype = uploadedFile.mimetype
    const filename = uploadedFile.filename
    const useCase = await makeUploadOrderFileUseCase({
      queueUri: env.RABBITMQ_URL,
    })
    const result = await useCase.execute({
      stream,
      filename,
      mimetype,
    })

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case BadRequestError:
          throw error
        case InvalidFileTypeError:
          throw error
        default:
          throw new BadRequestError(
            'Unknown error while trying to save order file.',
            'order_file',
          )
      }
    }

    return reply.status(201).send()
  }
}
