import type { Mock } from 'vitest'

import { env } from '@/config/env'
import { CouldNotFindOrCreateEntityError } from '@/errors/could-not-find-or-create-entity-error'
import { InvalidFieldFormatError } from '@/errors/invalid-field-format-error'
import { processLine } from '@/utils/process-line'

import type { ICustomerService } from '../customer/interface'
import type { IOrderService } from '../order/interface'
import type { QueueService } from '../queue/interface'
import type { ProcessRowsService } from './interface'
import { ProcessRowsWorkerService } from './process-rows-worker'

vi.mock('@/utils/process-line', () => ({
  processLine: vi.fn(),
}))
vi.mock('@/config/env', () => ({
  env: {
    QUEUE_NAME: 'QUEUE_NAME',
  },
}))

describe('Process Files Worder Service', () => {
  let processRowsWorkerService: ProcessRowsService
  let queueServiceMock: QueueService
  let customerService: ICustomerService
  let orderService: IOrderService

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

    customerService = {
      findOrCreateCustomer: vi.fn(),
    } as unknown as ICustomerService

    orderService = {
      addOrderProduct: vi.fn(),
      findOrCreateOrder: vi.fn(),
    } as unknown as IOrderService
    processRowsWorkerService = new ProcessRowsWorkerService(
      queueServiceMock,
      customerService,
      orderService,
    )
    vi.clearAllMocks()
  })

  it('should start the queue service with correct', async () => {
    await processRowsWorkerService.run()
    expect(queueServiceMock.start).toBeCalledTimes(1)
    expect(queueServiceMock.assertQueue).toBeCalledTimes(3)
    expect(queueServiceMock.consume).toBeCalledTimes(1)
  })

  it('should assert all required queues with the correct configurations', async () => {
    await processRowsWorkerService.run()
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
      `${env.QUEUE_NAME}.RETRY`,
      {
        durable: true,
        arguments: {
          'x-message-ttl': 1000 * 10,
          'x-dead-letter-exchange': '',
          'x-dead-letter-routing-key': env.QUEUE_NAME,
        },
      },
    )
  })

  it('should consume messages from the processFilesQueue', async () => {
    await processRowsWorkerService.run()

    expect(queueServiceMock.consume).toHaveBeenCalledTimes(1)
    expect(queueServiceMock.consume).toHaveBeenCalledWith(
      env.QUEUE_NAME,
      expect.any(Function),
    )
  })

  it('should retry sending the message if retries are below MAX_RETRIES', async () => {
    const content = Buffer.from('test message')
    const headers = { retries: 2 }

    await processRowsWorkerService.handleProcessMensagemError(
      content,
      headers,
      2,
    )

    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.RETRY`,
      content,
      {
        headers: { retries: 3 },
        persistent: true,
      },
    )
  })

  it('should send the message to the DLQ if retries exceed MAX_RETRIES', async () => {
    const MAX_RETRIES = 100
    const content = Buffer.from('test message')
    const headers = { retries: MAX_RETRIES }

    vi.spyOn(processRowsWorkerService, 'sendToDLDQueue')

    await processRowsWorkerService.handleProcessMensagemError(
      content,
      headers,
      MAX_RETRIES,
    )

    expect(processRowsWorkerService.sendToDLDQueue).toHaveBeenCalledWith(
      content,
    )
  })

  it('should send to DLQ if the message content is a different line with a length other than 94 characters', async () => {
    const headers = {}

    const mockMessage = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: 3,
          content:
            '00000                                    Sha Olson00000007020000000002     1419.692021071',
        }),
      ),
      fields: {},
      properties: {
        headers,
      },
    }

    await processRowsWorkerService.run()

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.DLQ`,
      mockMessage.content,
      { persistent: true, headers },
    )
  })

  it('should handle message processing successfully', async () => {
    const mockMessage = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: 3,
          content:
            '0000000075                                    Sha Olson00000007020000000002     1419.6920210718',
        }),
      ),
      fields: {},
      properties: {},
    }

    await processRowsWorkerService.run()

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
  })

  it('should handle InvalidFieldFormatError and send the message to the DLQ', async () => {
    const mockMessage = {
      content: Buffer.from(
        JSON.stringify(
          '0000000068                              Clifford Casper00000006500000000004      A20.27A0210716',
        ),
      ),
      properties: { headers: {} },
    }
    await processRowsWorkerService.run()
    ;(processLine as Mock).mockImplementation(() => {
      throw new InvalidFieldFormatError('Invalid format')
    })

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(mockMessage)

    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.DLQ`,
      mockMessage.content,
      expect.objectContaining({ persistent: true }),
    )

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(mockMessage)
  })
  it('should handle CouldNotFindOrCreateEntityError and retry the message', async () => {
    const messageMock = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: 3,
          content:
            '0000000075                                    Sha Olson00000007020000000002     1419.6920210718',
        }),
      ),
      properties: { headers: { retries: 0 } },
    }

    ;(processLine as Mock).mockReturnValue({
      customerId: 123,
      name: 'Leander',
      orderId: 456,
      date: '2025-01-01',
      productId: 789,
      value: 100,
    })
    ;(customerService.findOrCreateCustomer as Mock).mockRejectedValueOnce(
      new CouldNotFindOrCreateEntityError(
        'An unexpected error occurred while trying to find or create the customer.',
      ),
    )
    const handleProcessMensagemErrorSpy = vi.spyOn(
      processRowsWorkerService,
      'handleProcessMensagemError',
    )
    await processRowsWorkerService.run()

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(messageMock)

    expect(handleProcessMensagemErrorSpy).toHaveBeenCalledTimes(1)
    expect(handleProcessMensagemErrorSpy).toHaveBeenCalledWith(
      messageMock.content,
      messageMock.properties.headers,
      0,
    )
    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.RETRY`,
      messageMock.content,
      expect.objectContaining({
        headers: expect.objectContaining({
          retries: 1,
        }),
        persistent: true,
      }),
    )
    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(messageMock)
  })

  it('should handle retry logic and send message to DLQ after max retries', async () => {
    const MAX_RETRIES = 100
    const messageMock = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: 3,
          content:
            '0000000075                                    Sha Olson00000007020000000002     1419.6920210718',
        }),
      ),
      properties: { headers: { retries: MAX_RETRIES } },
    }

    ;(processLine as Mock).mockReturnValue({
      customerId: 123,
      name: 'Leander',
      orderId: 456,
      date: '2025-01-01',
      productId: 789,
      value: 100,
    })

    await processRowsWorkerService.run()

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(messageMock)

    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.DLQ`,
      messageMock.content,
      expect.objectContaining({ persistent: true }),
    )

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(messageMock)
  })

  it('should process customer and order creation', async () => {
    const orderFileId = 3
    const messageMock = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: orderFileId,
          content:
            '0000000075                                    Sha Olson00000007020000000002     1419.6920210718',
        }),
      ),
      properties: { headers: { retries: 5 } },
    }

    const line = {
      customerId: 123,
      name: 'Leander',
      orderId: 456,
      date: '2025-01-01',
      productId: 789,
      value: 100,
    }

    ;(processLine as Mock).mockReturnValue(line)

    await processRowsWorkerService.run()
    ;(customerService.findOrCreateCustomer as Mock).mockResolvedValue({
      user_id: line.customerId,
      name: line.name,
    })
    ;(orderService.findOrCreateOrder as Mock).mockResolvedValue({
      order_id: line.orderId,
    })
    ;(orderService.addOrderProduct as Mock).mockResolvedValue({})

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(messageMock)

    expect(customerService.findOrCreateCustomer).toHaveBeenCalledWith({
      externalCustomerIdFromFile: line.customerId,
      name: line.name,
      orderFileId,
    })
    expect(orderService.findOrCreateOrder).toHaveBeenCalled()
    expect(orderService.findOrCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        externalOrderIdFromFile: line.orderId,
        date: line.date,
        externalCustomerIdFromFile: line.customerId,
        orderFileId,
      }),
    )
    expect(orderService.addOrderProduct).toHaveBeenCalledWith({
      externalOrderIdFromFile: line.orderId,
      externalProductIdFromFile: line.productId,
      externalCustomerIdFromFile: line.customerId,
      orderFileId,
      currentProductValue: line.value,
    })

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(messageMock)
  })

  it('should handle errors in order creation and retry or send to DLQ', async () => {
    const orderFileId = 3
    const messageMock = {
      content: Buffer.from(
        JSON.stringify({
          order_file_id: orderFileId,
          content:
            '0000000075                                    Sha Olson00000007020000000002     1419.6920210718',
        }),
      ),
      properties: { headers: { retries: 0 } },
    }

    const line = {
      customerId: 123,
      name: 'Leander',
      orderId: 456,
      date: '2025-01-01',
      productId: 789,
      value: 100,
    }

    ;(processLine as Mock).mockReturnValue(line)

    await processRowsWorkerService.run()
    ;(customerService.findOrCreateCustomer as Mock).mockResolvedValue({
      user_id: 123,
      name: 'Leander',
    })
    ;(orderService.findOrCreateOrder as Mock).mockResolvedValue({
      order_id: 456,
    })
    ;(orderService.addOrderProduct as Mock).mockRejectedValueOnce(
      new Error('Error creating order product'),
    )

    const consumeCallback = (queueServiceMock.consume as Mock).mock.calls[0][1]
    await consumeCallback(messageMock)

    expect(queueServiceMock.sendToQueue).toHaveBeenCalledWith(
      `${env.QUEUE_NAME}.RETRY`,
      messageMock.content,
      expect.objectContaining({
        headers: expect.objectContaining({
          retries: 1,
        }),
        persistent: true,
      }),
    )

    expect(queueServiceMock.confirmAck).toHaveBeenCalledWith(messageMock)
  })
})
