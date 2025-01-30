import type { Message, Options } from 'amqplib'
import * as amqp from 'amqplib'

import { RabbitMQConnectionError } from '@/errors/rabbitMQ-connection-error'

import type { QueueService, StartParms } from '../interface'

export class RabbitMQService implements QueueService {
  private connection: amqp.Connection | null = null
  private consumerChannel: amqp.Channel | null = null
  private producerChannel: amqp.Channel | null = null
  private readonly url: string
  constructor(rabbitMQUrl: string) {
    this.url = rabbitMQUrl
  }

  async start(params?: StartParms) {
    try {
      await this.createConnection()
      await this.onConnectionClose()
      await this.createConsumerChannel(params?.consumerPrefetch)
      await this.createProducerChannel(params?.producerPrefetch)
      console.log('RabbitMQ service initialized successfully.')
    } catch (error) {
      console.log('Retrying initialization in 3 seconds...')
      await new Promise((resolve) => setTimeout(resolve, 3000))
      await this.start({
        consumerPrefetch: params?.consumerPrefetch,
        producerPrefetch: params?.producerPrefetch,
      })
    }
  }

  public async createConnection(): Promise<void> {
    this.connection = await amqp.connect(this.url)
  }

  //   public async createConnection(): Promise<void> {
  //     try {
  //       this.connection = await amqp.connect(this.url)
  //       await this.onConnectionClose()
  //       console.log('RabbitMQ connection established.')
  //     } catch (error) {
  //       console.error('Failed to connect to RabbitMQ. Retrying in 3 seconds...')
  //       await new Promise((resolve) => setTimeout(resolve, 3000))
  //       await this.createConnection()
  //     }
  //   }

  private async onConnectionClose() {
    if (this.connection) {
      this.connection.on('close', async () => {
        this.connection = null
        this.consumerChannel = null
        this.producerChannel = null
        await this.start()
      })
    }
  }

  async createConsumerChannel(prefetch?: number) {
    if (!this.connection) {
      throw new RabbitMQConnectionError()
    }
    if (!this.consumerChannel) {
      this.consumerChannel = await this.connection.createChannel()
      if (prefetch) {
        await this.consumerChannel.prefetch(prefetch)
      }
    }
  }

  async createProducerChannel(prefetch?: number) {
    if (!this.connection) {
      throw new RabbitMQConnectionError()
    }
    if (!this.producerChannel) {
      this.producerChannel = await this.connection.createChannel()
      if (prefetch) {
        await this.producerChannel.prefetch(prefetch)
      }
    }
  }

  async assertQueue(
    channel: 'CONSUMER' | 'PRODUCER',
    queueName: string,
    options: Options.AssertQueue,
  ): Promise<void> {
    if (channel === 'CONSUMER') {
      if (!this.consumerChannel) {
        throw new RabbitMQConnectionError(
          'RabbitMQ consumer channel is not initialized.',
        )
      }
      await this.consumerChannel.assertQueue(queueName, options)
      return
    }

    if (channel === 'PRODUCER') {
      if (!this.producerChannel) {
        throw new RabbitMQConnectionError(
          'RabbitMQ producer channel is not initialized.',
        )
      }
      await this.producerChannel.assertQueue(queueName, options)
    }
  }

  sendToQueue(
    queueName: string,
    message: Buffer,
    options: Options.Publish,
  ): void {
    if (!this.producerChannel) {
      throw new RabbitMQConnectionError('RabbitMQ channel is not initialized.')
    }

    this.producerChannel.sendToQueue(queueName, message, options)
  }

  async consume(
    queueName: string,
    onMessage: (msg: Message) => Promise<void>,
  ): Promise<void> {
    if (!this.consumerChannel) {
      throw new RabbitMQConnectionError(
        'RabbitMQ consumer channel is not initialized.',
      )
    }

    this.consumerChannel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          await onMessage(msg)
        } catch (error) {
          this.consumerChannel?.ack(msg)
        }
      }
    })
  }

  confirmAck(msg: amqp.Message) {
    if (!this.consumerChannel) {
      throw new RabbitMQConnectionError(
        'RabbitMQ consumer channel is not initialized.',
      )
    }
    this.consumerChannel.ack(msg)
  }

  async close(): Promise<void> {
    if (this.consumerChannel) {
      await this.consumerChannel.close()
      this.consumerChannel = null
    }

    if (this.producerChannel) {
      await this.producerChannel.close()
      this.producerChannel = null
    }

    if (this.connection) {
      await this.connection.close()
      this.connection = null
    }
  }
}
