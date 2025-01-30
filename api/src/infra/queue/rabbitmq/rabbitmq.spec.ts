import amqp from 'amqplib'
import type { Mock } from 'vitest'

import { RabbitMQConnectionError } from '@/core/errors/rabbitMQ-connection-error'

import { RabbitMQService } from './rabbitmq'

vi.mock('amqplib') // Fazendo mock da biblioteca amqplib

describe('RabbitMQService', () => {
  let mockConnection: any
  let mockChannel: any

  beforeEach(async () => {
    // Resetando a instância antes de cada teste
    ;(RabbitMQService as any)._instance = null
    vi.clearAllMocks()
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

    // complete
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a connection', async () => {
    await RabbitMQService.getInstance('rabbitmq_url')
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
  })

  it('should try to connect to rabbitmq if first connection fails', async () => {
    vi.useFakeTimers()
    ;(amqp.connect as Mock)
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValue(mockConnection)

    const connectionPromise = RabbitMQService.getInstance('rabbitmq_url')
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
    await RabbitMQService.getInstance('rabbitmq_url')

    expect(amqp.connect).toHaveBeenCalledTimes(1)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
    const closeCallback = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'close',
    )?.[1]
    expect(closeCallback).toBeDefined()
    closeCallback && (await closeCallback())

    expect(amqp.connect).toHaveBeenCalledTimes(2)
    expect(amqp.connect).toHaveBeenCalledWith('rabbitmq_url')
  })

  it('should try to reconnect to rabbitmq if connection close and perform two reconnection attempts', async () => {
    vi.useFakeTimers()
    ;(amqp.connect as Mock)
      .mockResolvedValueOnce(mockConnection)
      .mockRejectedValueOnce(new Error('Connection failed'))
      .mockResolvedValue(mockConnection)

    await RabbitMQService.getInstance('rabbitmq_url')
    expect(amqp.connect).toHaveBeenCalledTimes(1)
    const closeCallback = mockConnection.on.mock.calls.find(
      (call: any) => call[0] === 'close',
    )?.[1]
    expect(closeCallback).toBeDefined()
    const promise = closeCallback()
    vi.advanceTimersByTimeAsync(3000)
    await promise

    expect(amqp.connect).toHaveBeenCalledTimes(3)
  })

  it('should create a producer channel if connection exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    const rabbitMQService = await RabbitMQService.getInstance('rabbitmq_url')
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
    vi.clearAllMocks()
    await rabbitMQService.close()
    ;(RabbitMQService as any)._instance = null
    await RabbitMQService.getInstance('rabbitmq_url')
    expect(mockConnection.createChannel).toHaveBeenCalledTimes(1)
  })

  it('should throw an error if no connection exists when try to create a channel', async () => {
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')

    ;(rabbitMQService as any).connection = null
    vi.clearAllMocks()

    await expect(rabbitMQService.createChannel()).rejects.toThrow(
      RabbitMQConnectionError,
    )

    expect(mockConnection.createChannel).not.toHaveBeenCalled()
  })

  it('should not create a new channel if one already exists', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')
    await rabbitMQService.createConnection()
    await rabbitMQService.createConnection()
    expect(mockConnection.createChannel).not.toHaveBeenCalledTimes(2)
    expect(mockChannel.prefetch).not.toHaveBeenCalledTimes(2)
  })

  it('should assert a queue', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')
    await rabbitMQService.assertQueue('queue')
    expect(mockChannel.assertQueue).toHaveBeenCalledTimes(1)
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('queue', {
      durable: true,
    })
  })

  it('should throw error if no channel when asserting a queue', async () => {
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')

    ;(rabbitMQService as any).connection = null
    ;(rabbitMQService as any).channel = null
    vi.clearAllMocks()

    await expect(rabbitMQService.assertQueue('queue')).rejects.toThrow(
      RabbitMQConnectionError,
    )

    expect(mockConnection.createChannel).not.toHaveBeenCalled()
  })

  it('should send a message to queue', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')
    await rabbitMQService.publish('queue', 'leander')
    expect(mockChannel.sendToQueue).toHaveBeenCalledTimes(1)
    expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
      'queue',
      Buffer.from(JSON.stringify('leander')),
      {
        persistent: true,
      },
    )
  })

  it('should throw error if no channel when sending a message', async () => {
    ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
    const rabbitMQService =
      await RabbitMQService.getInstance('amqp://localhost')
    ;(rabbitMQService as any).channel = null

    await expect(
      rabbitMQService.publish('queue', 'leander'),
    ).rejects.toThrowError(RabbitMQConnectionError)

    await expect(
      rabbitMQService.publish('queue', 'leander'),
    ).rejects.toThrowError('RabbitMQ channel is not initialized.')

    expect(mockChannel.sendToQueue).not.toHaveBeenCalled()
  })

  // it('should close connection and channel', async () => {
  //   ;(amqp.connect as Mock).mockResolvedValue(mockConnection)
  //   await rabbitMQService.start()
  //   const promise = rabbitMQService.close()
  //   await expect(promise).resolves.toBe(undefined)
  //   await expect(promise).resolves.not.toThrow()
  //   expect(mockChannel.close).toHaveBeenCalledTimes(2)
  //   expect(mockConnection.close).toHaveBeenCalledTimes(1)
  // })
})
