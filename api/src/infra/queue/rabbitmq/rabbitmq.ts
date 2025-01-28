import amqp, { Channel, Connection } from 'amqplib'

import { RabbitMQConnectionError } from '@/core/errors/rabbitMQ-connection-error'
import type { QueueService } from '@/infra/queue/interface'

export class RabbitMQService implements QueueService {
  private static _instance: RabbitMQService | null = null
  private connection: Connection | null = null
  private channel: Channel | null = null

  private static readonly MAX_RETRY_ATTEMPTS = 2
  private retryAttempts = 0

  private constructor(private readonly uri: string) {}

  static async getInstance(uri: string) {
    if (!RabbitMQService._instance) {
      try {
        RabbitMQService._instance = new RabbitMQService(uri)
        await RabbitMQService._instance.createConnection()
      } catch (error) {
        RabbitMQService._instance = null
        throw error
      }
    }
    return RabbitMQService._instance
  }

  private async createConnection(): Promise<void> {
    try {
      if (!this.connection) {
        this.connection = await amqp.connect(this.uri)
        this.retryAttempts = 0
        await this.createChannel()
        await this.onConnectionClose()
      }
    } catch (err) {
      this.connection = null
      this.channel = null
      this.retryAttempts++
      if (this.retryAttempts >= RabbitMQService.MAX_RETRY_ATTEMPTS) {
        throw new RabbitMQConnectionError('Could not connect to RabbitMQ.')
      }
      // setTimeout(() => this.createConnection(), 3000)
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(this.createConnection()) // Tentar novamente após 3 segundos
        }, 3000),
      )
    }
  }

  private async onConnectionClose() {
    if (this.connection) {
      this.connection.on('close', async () => {
        this.connection = null
        this.channel = null
        await this.createConnection()
      })
    }
  }

  private async createChannel() {
    if (!this.connection) throw new RabbitMQConnectionError()
    this.channel = await this.connection.createChannel()
  }

  async assertQueue(queueName: string): Promise<void> {
    if (!this.connection) {
      throw new RabbitMQConnectionError()
    }
    if (!this.channel) {
      throw new RabbitMQConnectionError('RabbitMQ channel is not initialized')
    }
    await this.channel.assertQueue(queueName, { durable: true })
  }

  async publish(queueName: string, message: any): Promise<void> {
    if (!this.connection) {
      throw new RabbitMQConnectionError()
    }
    if (!this.channel) {
      throw new RabbitMQConnectionError('RabbitMQ channel is not initialized')
    }
    await this.assertQueue(queueName)
    this.channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    })
    console.log(`Message sent to queue "${queueName}":`, message)
  }

  async close() {
    try {
      if (!this.connection)
        throw new RabbitMQConnectionError('RabbitMQ is not initialized')
      if (!this.channel)
        throw new RabbitMQConnectionError(
          'RabbitMQ consumer channel is not initialized',
        )
      await this.channel.close()
      await this.connection.close()
      console.log('RabbitMQ connection closed')
    } catch (error) {
      console.error('Failed to close RabbitMQ connection:', error)
    }
  }
}
