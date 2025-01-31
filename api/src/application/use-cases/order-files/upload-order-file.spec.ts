import { Readable } from 'node:stream'

import { InMemoryOrderFileRepository } from 'test/repositories/in-memory-order-file-repository'
import type { Mock } from 'vitest'

import { InvalidFileTypeError } from '@/core/errors/invalid-file-type-error'
import type { QueueService } from '@/infra/queue/interface'
import type { StorageService } from '@/infra/storage/interface'

import { UploadOrderFileUseCase } from './upload-order-file'

const makeSut = () => {
  const orderFileRepository = new InMemoryOrderFileRepository()
  const queueMock: QueueService = {
    assertQueue: vi.fn(),
    publish: vi.fn(),
    close: vi.fn(),
    createChannel: vi.fn(),
    createConnection: vi.fn(),
  }

  const storageMock: StorageService = {
    upload: vi.fn(),
    createBucketIfNotExists: vi.fn(),
  }
  const sut = new UploadOrderFileUseCase(
    orderFileRepository,
    storageMock,
    queueMock,
  )
  return {
    sut,
    orderFileRepository,
    storageMock,
    queueMock,
  }
}
describe('Upload order file', () => {
  it('should not be possible to save a file with an invalid mimetype', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      filename: 'text.txt',
      mimetype: 'text/javascript',
      stream: Readable.from(''),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidFileTypeError)
  })

  it('should not be possible to save a file with an invalid extension', async () => {
    const { sut } = makeSut()
    const result = await sut.execute({
      filename: 'text.js',
      mimetype: 'text/plain',
      stream: Readable.from(''),
    })

    expect(result.isLeft()).toBeTruthy()
    expect(result.value).toBeInstanceOf(InvalidFileTypeError)
  })

  it('should be possible to save a valid file', async () => {
    const { sut, storageMock, orderFileRepository, queueMock } = makeSut()
    const orderFileRepositorySpy = vi.spyOn(orderFileRepository, 'create')

    ;(storageMock.upload as Mock).mockResolvedValue({
      bucket: 'bucket',
      key: 'key',
    })

    const result = await sut.execute({
      filename: 'text.txt',
      mimetype: 'text/plain',
      stream: Readable.from(''),
    })

    expect(result.isRight()).toBeTruthy()
    expect(orderFileRepositorySpy).toHaveBeenCalledTimes(1)
    expect(storageMock.upload).toHaveBeenCalledTimes(1)
    expect(queueMock.assertQueue).toHaveBeenCalledTimes(1)
    expect(queueMock.publish).toHaveBeenCalledTimes(1)
  })
})
