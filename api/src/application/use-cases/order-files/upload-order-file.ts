import { extname } from 'node:path'
import type { Readable } from 'node:stream'

import { env } from '@/config/env'
import { type Either, left, right } from '@/core/either'
import { InvalidFileTypeError } from '@/core/errors/invalid-file-type-error'
import { OrderFile } from '@/domain/entities/order-file'

import { BadRequestError } from '../../../core/errors/bad-request-error'
import type { QueueService } from '../../../infra/queue/interface'
import type { StorageService } from '../../../infra/storage/interface'
import type { OrderFileRepository } from '../../repositories/order-file-repository'

interface UploadOrderFileUseCaseRequest {
  stream: string | Uint8Array | Buffer | Readable
  filename: string
  mimetype: string
}

type UploadOrderFileUseCaseResponse = Either<
  BadRequestError | InvalidFileTypeError,
  null
>

export class UploadOrderFileUseCase {
  constructor(
    private orderFileRepository: OrderFileRepository,
    private storage: StorageService,
    private queueService: QueueService,
  ) {}

  async execute({
    stream,
    filename,
    mimetype,
  }: UploadOrderFileUseCaseRequest): Promise<UploadOrderFileUseCaseResponse> {
    const extensionFile = extname(filename)

    const mimeTypeRegex = /^text\/plain$/
    const isValidFileFormat = mimeTypeRegex.test(mimetype)

    if (!isValidFileFormat) {
      return left(new InvalidFileTypeError())
    }

    const validExtension = ['txt']

    if (!validExtension.includes(extensionFile.replace('.', ''))) {
      return left(new InvalidFileTypeError())
    }

    const { bucket, key } = await this.storage.upload({
      body: stream,
      filename,
      mimetype,
    })

    const orderFile = OrderFile.create({
      bucket,
      key,
      name: filename,
      status: 'PROCESSING',
      url: key,
    })

    const orderFileCreated = await this.orderFileRepository.create(orderFile)

    try {
      await this.queueService.assertQueue(env.QUEUE_PROCESS_FILES)
      await this.queueService.publish(env.QUEUE_PROCESS_FILES, {
        order_file_id: orderFileCreated.id.toValue(),
      })
    } catch (error) {
      console.log(error)
    }

    return right(null)
  }
}
