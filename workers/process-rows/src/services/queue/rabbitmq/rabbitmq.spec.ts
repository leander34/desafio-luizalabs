/* eslint-disable @typescript-eslint/no-explicit-any */
import * as amqp from 'amqplib'
import type { Mock } from 'vitest'

import { env } from '@/config/env'
import { RabbitMQConnectionError } from '@/errors/rabbitMQ-connection-error'

import { RabbitMQService } from './rabbitmq'
vi.mock('amqplib')

vi.mock('@/config/env', () => ({
  env: {
    RABBITMQ_URL: 'rabbitmq_url',
  },
}))
vi.mock('./errors/rabbitMQ-connection-error', () => ({
  RabbitMQConnectionError: class RabbitMQConnectionError extends Error {},
}))

describe('RabbitMQ Service', () => {
  let rabbitMQService: RabbitMQService
  let mockConnection: any
  let mockChannel: any

  beforeEach(() => {
    mockChannel = {
      prefetch: vi.fn(),
      assertQueue: vi.fn(),
      consume: vi.fn(),
      sendToQueue: vi.fn(),
      ack: vi.fn(),
      close: vi.fn(),
    }

    mockConnection = {
      createChannel: vi.fn().mockResolvedValue(mockChannel),
      on: vi.fn(),
      emit: vi.fn(),
      close: vi.fn(),
    }

    vi.spyOn(amqp, 'connect').mockResolvedValue(mockConnection)

    rabbitMQService = new RabbitMQService(env.RABBITMQ_URL)

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a connection', async () => {
    await rabbitMQService.createConnection()
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
  })

  it('should try to connect to rabbitmq if first connection fails', async () => {
    vi.useFakeTimers()
    ;(amqp.connect as Mock)
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValue(mockConnection)

    const connectionPromise = rabbitMQService.start()
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTimeAsync(3000)
    await connectionPromise
    expect(amqp.connect).toHaveBeenCalledTimes(2)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
  })

  it('should try to reconnect to rabbitmq if connection close', async () => {
    vi.useFakeTimers()
    ;(amqp.connect as Mock)
      .mockResolvedValueOnce(mockConnection)
      .mockResolvedValue(mockConnection)

    const createConnectionSpy = vi.spyOn(rabbitMQService, 'createConnection')
    const startSpy = vi.spyOn(rabbitMQService, 'start')

    await rabbitMQService.start()
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
    const closeCallback = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'close',
    )?.[1]
    expect(closeCallback).toBeDefined()
    closeCallback && (await closeCallback())

    expect(createConnectionSpy).toHaveBeenCalledTimes(2)
    expect(startSpy).toHaveBeenCalledTimes(2)
    expect(amqp.connect).toHaveBeenCalledTimes(2)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
  })

  it('should try to reconnect to rabbitmq if connection close and perform two reconnection attempts', async () => {
    vi.useFakeTimers()
    ;(amqp.connect as Mock)
      .mockResolvedValueOnce(mockConnection)
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValue(mockConnection)

    const createConnectionSpy = vi.spyOn(rabbitMQService, 'createConnection')
    const startSpy = vi.spyOn(rabbitMQService, 'start')

    await rabbitMQService.start()
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    const closeCallback = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'close',
    )?.[1]
    expect(closeCallback).toBeDefined()
    const promise = closeCallback()
    vi.advanceTimersByTimeAsync(3000)
    await promise

    expect(createConnectionSpy).toHaveBeenCalledTimes(3)
    expect(startSpy).toHaveBeenCalledTimes(3)
    expect(amqp.connect).toHaveBeenCalledTimes(3)
  })

  it('should create a consumer channel if connection exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    const prefetchValue = 10
    await rabbitMQService.createConsumerChannel(prefetchValue)
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledWith(prefetchValue)
    vi.clearAllMocks()
    await rabbitMQService.close()
    await rabbitMQService.createConnection()
    await rabbitMQService.createConsumerChannel()
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledTimes(0)
  })

  it('should create a producer channel if connection exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    const prefetchValue = 10
    await rabbitMQService.createProducerChannel(prefetchValue)
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledWith(prefetchValue)
    vi.clearAllMocks()
    await rabbitMQService.close()
    await rabbitMQService.createConnection()
    await rabbitMQService.createConsumerChannel()
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
    expect(mockChannel.prefetch).toHaveBeenCalledTimes(0)
  })

  it('should throw an error if no connection exists when try to create a consumer channel', async () => {
    await expect(
      rabbitMQService.createConsumerChannel(10),
    ).rejects.toThrowError(RabbitMQConnectionError)
    expect(mockConnection.createChannel).not.toHaveBeenCalled()
    expect(mockChannel.prefetch).not.toHaveBeenCalled()
  })

  it('should throw an error if no connection exists when try to create a producer channel', async () => {
    await expect(
      rabbitMQService.createProducerChannel(10),
    ).rejects.toThrowError(RabbitMQConnectionError)
    expect(mockConnection.createChannel).not.toHaveBeenCalled()
    expect(mockChannel.prefetch).not.toHaveBeenCalled()
  })

  it('should not create a new consumer channel if one already exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    await rabbitMQService.createConsumerChannel(10)
    await rabbitMQService.createConsumerChannel(10)
    expect(mockConnection.createChannel).not.toHaveBeenCalledTimes(2)
    expect(mockChannel.prefetch).not.toHaveBeenCalledTimes(2)
  })

  it('should not create a new producer channel if one already exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    await rabbitMQService.createProducerChannel(10)
    await rabbitMQService.createProducerChannel(10)
    expect(mockConnection.createChannel).not.toHaveBeenCalledTimes(2)
    expect(mockChannel.prefetch).not.toHaveBeenCalledTimes(2)
  })

  it('should prefetch', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    await rabbitMQService.createConsumerChannel(5)
    await rabbitMQService.createProducerChannel(5)
    expect(mockChannel.prefetch).toHaveBeenCalledTimes(2)
  })

  it('should assert a queue as a consumer', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    await rabbitMQService.assertQueue('CONSUMER', 'queue', {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60, // 1 hora
      },
    })
    expect(mockChannel.assertQueue).toHaveBeenCalledTimes(1)
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('queue', {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60, // 1 hora
      },
    })
  })

  it('should assert a queue as a producer', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    await rabbitMQService.assertQueue('PRODUCER', 'queue', {
      durable: true,
    })
    expect(mockChannel.assertQueue).toHaveBeenCalledTimes(1)
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('queue', {
      durable: true,
    })
  })

  it('should throw error if no channel when asserting a queue as a consumer', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    await expect(
      rabbitMQService.assertQueue('CONSUMER', 'queue', { durable: true }),
    ).rejects.toThrowError(RabbitMQConnectionError)
    await expect(
      rabbitMQService.assertQueue('CONSUMER', 'queue', { durable: true }),
    ).rejects.toThrow('RabbitMQ consumer channel is not initialized.')
    expect(mockChannel.assertQueue).not.toHaveBeenCalled()
  })

  it('should throw error if no channel when asserting a queue as a producer', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    await expect(
      rabbitMQService.assertQueue('PRODUCER', 'queue', { durable: true }),
    ).rejects.toThrowError(RabbitMQConnectionError)
    await expect(
      rabbitMQService.assertQueue('PRODUCER', 'queue', { durable: true }),
    ).rejects.toThrow('RabbitMQ producer channel is not initialized.')
    expect(mockChannel.assertQueue).not.toHaveBeenCalled()
  })

  it('should send a message to queue', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    rabbitMQService.sendToQueue('queue', Buffer.from('oi'), {
      persistent: true,
    })
    expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1)
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'queue',
      Buffer.from('oi'),
      {
        persistent: true,
      },
    )
  })

  it('should throw error if no producer channel when sending a message', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    expect(() =>
      rabbitMQService.sendToQueue('queue', Buffer.from('oi'), {
        persistent: true,
      }),
    ).toThrowError(RabbitMQConnectionError)
    expect(() =>
      rabbitMQService.sendToQueue('queue', Buffer.from('oi'), {
        persistent: true,
      }),
    ).toThrowError('RabbitMQ channel is not initialized.')

    expect(mockChannel.sendToQueue).not.toHaveBeenCalled()
  })

  it('should consume a message from the queue and execute the callback successfully', async () => {
    const mockMessage = { content: Buffer.from('message') }
    mockChannel.consume = vi.fn((queue, onMessage) => {
      onMessage(mockMessage)
    })
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    const onMessage = vi.fn()
    await rabbitMQService.consume('queue', onMessage)
    expect(mockChannel.consume).toHaveBeenCalledTimes(1)
    expect(mockChannel.consume).toHaveBeenCalledWith(
      'queue',
      expect.any(Function),
    )
    expect(onMessage).toHaveBeenCalledWith(mockMessage)
  })

  it('should ack the message even if the callback throws an error', async () => {
    const mockMessage = { content: Buffer.from('message') }
    mockChannel.consume = vi.fn((queue, onMessage) => {
      onMessage(mockMessage)
    })
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    const onMessage = vi
      .fn()
      .mockRejectedValueOnce(new Error('Processing error'))
    await rabbitMQService.consume('queue', onMessage)
    expect(mockChannel.consume).toHaveBeenCalledTimes(1)
    expect(mockChannel.consume).toHaveBeenCalledWith(
      'queue',
      expect.any(Function),
    )
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage)
  })

  it('should not consume or process a message if msg is null', async () => {
    mockChannel.consume = vi.fn((queue, onMessage) => {
      onMessage(null)
    })
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    const onMessage = vi.fn()
    await rabbitMQService.consume('queue', onMessage)
    expect(mockChannel.consume).toHaveBeenCalledTimes(1)
    expect(mockChannel.consume).toHaveBeenCalledWith(
      'queue',
      expect.any(Function),
    )
    expect(mockChannel.ack).not.toHaveBeenCalled()
    expect(onMessage).not.toHaveBeenCalled()
  })

  it('should throw error if no consumer channel when consuming a message', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    const queue = 'queue'
    const onMessage = vi.fn()

    await expect(
      rabbitMQService.consume(queue, onMessage),
    ).rejects.toThrowError(RabbitMQConnectionError)
    await expect(
      rabbitMQService.consume(queue, onMessage),
    ).rejects.toThrowError('RabbitMQ consumer channel is not initialized.')

    expect(mockChannel.consume).not.toHaveBeenCalled()
  })
  it('should close connection and channel', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    const promise = rabbitMQService.close()
    await expect(promise).resolves.toBe(undefined)
    await expect(promise).resolves.not.toThrow()
    expect(mockChannel.close).toHaveBeenCalledTimes(2)
    expect(mockConnection.close).toHaveBeenCalledTimes(1)
  })

  it('should be able to confirm a msg', async () => {
    const mockMsg: amqp.Message = {
      content: Buffer.from('test'),
    } as amqp.Message
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.start()
    rabbitMQService.confirmAck(mockMsg)
    expect(mockChannel.ack).toHaveBeenCalledTimes(1)
  })

  it('should throw error if no consumer channel when ack a message', async () => {
    const mockMsg: amqp.Message = {
      content: Buffer.from('test'),
    } as amqp.Message
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    await rabbitMQService.createConnection()
    expect(() => rabbitMQService.confirmAck(mockMsg)).toThrow(
      'RabbitMQ consumer channel is not initialized.',
    )
  })
})
