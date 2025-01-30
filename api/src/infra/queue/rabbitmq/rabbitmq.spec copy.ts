import amqp from 'amqplib'

import { RabbitMQConnectionError } from '@/core/errors/rabbitMQ-connection-error'

import { RabbitMQService } from './rabbitmq'

vi.mock('amqplib') // Fazendo mock da biblioteca amqplib

describe('RabbitMQService', () => {
  // let rabbitMQService: RabbitMQService
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

    // complete
    // rabbitMQService =
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a single instance of RabbitMQService', async () => {
    const instance1 = await RabbitMQService.getInstance('amqp://localhost')
    const instance2 = await RabbitMQService.getInstance('amqp://localhost')

    expect(instance1).toBe(instance2)
  })

  it('should throw an error if the connection fails to create the instance', async () => {
    // Mock para simular falha na conexão
    vi.spyOn(amqp, 'connect').mockRejectedValueOnce(
      new Error('Connection failed'),
    )

    try {
      await RabbitMQService.getInstance('amqp://localhost')
    } catch (error) {
      expect(error).toBeInstanceOf(RabbitMQConnectionError)
      expect((error as Error).message).toBe('Connection failed')
    }
  })

  // it('should return a null instance if the connection fails', async () => {
  //   // Mock para simular falha na conexão
  //   vi.spyOn(amqp, 'connect').mockRejectedValue(new Error('Connection failed'))
  //   const a = await RabbitMQService.getInstance('amqp://localhost')

  //   try {
  //     await RabbitMQService.getInstance('amqp://localhost')
  //   } catch (error) {
  //     expect(error).toBeInstanceOf(RabbitMQConnectionError) // Espera-se que um erro do tipo RabbitMQConnectionError seja lançado
  //     expect((error as Error).message).toBe('Connection failed')
  //   }

  //   expect(a).toBe(null)
  // })
})
