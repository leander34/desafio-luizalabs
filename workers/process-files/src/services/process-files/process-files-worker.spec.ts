import { Readable } from 'node:stream'

import type { Mock } from 'vitest'

import { env } from '@/config/env'

import type { IOrderFileService } from '../order-file/interface'
import type { QueueService } from '../queue/interface'
import type { StorageService } from '../storage/interface'
import type { ProcessFilesService } from './interface'
import { ProcessFilesWorkerService } from './process-files-worker'

vi.mock('@/config/env', () => ({
  env: {
    QUEUE_NAME: 'QUEUE_NAME',
    ROW_PROCESSING_QUEUE: 'ROW_PROCESSING_QUEUE',
  },
}))

describe('Process Files Worder Service', () => {
  let processFilesWorkerService: ProcessFilesService
  let queueServiceMock: QueueService
  let storageServiceMock: StorageService
  let orderFileServiceMock: IOrderFileService

  beforeEach(() => {
    queueServiceMock = {
      assertQueue: vi.fn().mockResolvedValue(undefined),
      start: vi.fn(),
      consume: vi.fn(),
      sendToQueue: vi.fn(),
      confirmAck: vi.fn(),
      createConnection: vi.fn(),
      createConsumerChannel: vi.fn(),
      createProducerChannel: vi.fn(),
      close: vi.fn(),
    } as unknown as QueueService
    storageServiceMock = {
      download: vi.fn(),
    } as unknown as StorageService
    orderFileServiceMock = {
      getOrderFile: vi.fn().mockResolvedValue({
        order_file: { bucket: 'bucket', key: 'key' },
      }),
      changeOrderFileStatus: vi.fn(),
    } as unknown as IOrderFileService
    processFilesWorkerService = new ProcessFilesWorkerService(
      queueServiceMock,
      storageServiceMock,
      orderFileServiceMock,
    )
    vi.clearAllMocks()
  })

  it('should start the queue service with correct', async () => {
    await processFilesWorkerService.run()
    expect(queueServiceMock.start).toBeCalledTimes(1)
    expect(queueServiceMock.assertQueue).toBeCalledTimes(3)
    expect(queueServiceMock.consume).toBeCalledTimes(1)
  })

  it('should assert all required queues with the correct configurations', async () => {
    await processFilesWorkerService.run()
    expect(queueServiceMock.assertQueue).toBeCalledTimes(3)
    expect(queueServiceMock.assertQueue).toHaveBeenNthCalledWith(
      1,
      'CONSUMER',
      env.QUEUE_NAME,
      { durable: true },
    )
    expect(queueServiceMock.assertQueue).toHaveBeenNthCalledWith(
      2,
      'PRODUCER',
      `${env.QUEUE_NAME}.DLQ`,
      { durable: true, arguments: { 'x-message-ttl': 1000 * 60 * 60 } },
    )
    expect(queueServiceMock.assertQueue).toHaveBeenNthCalledWith(
      3,
      'PRODUCER',
      env.ROW_PROCESSING_QUEUE,
      { durable: true },
    )
  })

  it('should consume messages from the processFilesQueue', async () => {
    await processFilesWorkerService.run()

    expect(queueServiceMock.consume).toHaveBeenCalledTimes(1)
    expect(queueServiceMock.consume).toHaveBeenCalledWith(
      env.QUEUE_NAME,
      expect.any(Function),
    )
  })

  it('should handle message processing successfully', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify({ order_file_id: 1 })),
      fields: {},
      properties: {},
    }

    const mockFileStream = Readable.from(['line1\n', 'line2\n'])

    ;(storageServiceMock.download as Mock).mockResolvedValue(mockFileStream)

    await processFilesWorkerService.run()

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(orderFileServiceMock.getOrderFile).toHaveBeenCalledWith({
      orderFileId: 1,
    })

    expect(storageServiceMock.download).toHaveBeenCalledWith({
      bucket: 'bucket',
      key: 'key',
    })

    expect(queueServiceMock.sendToQueue).toHaveBeenCalledTimes(2)
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      env.ROW_PROCESSING_QUEUE,
      Buffer.from(JSON.stringify('line1')),
      { persistent: true },
    )
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      env.ROW_PROCESSING_QUEUE,
      Buffer.from(JSON.stringify('line2')),
      { persistent: true },
    )

    expect(orderFileServiceMock.changeOrderFileStatus).toHaveBeenCalledWith({
      orderFileId: 1,
      status: 'PROCESSED',
    })

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
  })

  it('should handle error when the file cannot be fetched', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify({ order_file_id: 1 })),
      fields: {},
      properties: {},
    }
    await processFilesWorkerService.run()
    ;(storageServiceMock.download as Mock).mockResolvedValue(null)

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(orderFileServiceMock.changeOrderFileStatus).toHaveBeenCalledWith({
      orderFileId: 1,
      status: 'PROCESSING_ERROR',
      error: 'Unable to fetch file from s3.',
    })

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
  })

  it('should send message to dead-letter queue on error', async () => {
    const mockMessage = {
      content: Buffer.from(JSON.stringify({ order_file_id: 1 })),
      fields: {},
      properties: {},
    }
    await processFilesWorkerService.run()
    ;(orderFileServiceMock.getOrderFile as Mock).mockRejectedValue(
      new Error('Unexpected error'),
    )

    const sendToDLDQueueSpy = vi.spyOn(
      processFilesWorkerService,
      'sendToDLDQueue',
    )

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(orderFileServiceMock.changeOrderFileStatus).toHaveBeenCalledWith({
      orderFileId: 1,
      status: 'PROCESSING_ERROR',
      error: 'Unknown error while trying to process file.',
    })

    expect(sendToDLDQueueSpy).toHaveBeenCalledWith(mockMessage.content)
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledTimes(1)
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.DLQ`,
      mockMessage.content,
      { persistent: true },
    )
    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
  })
})
