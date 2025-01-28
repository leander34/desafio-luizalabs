import readline from 'node:readline'

import amqp from 'amqplib'

import { env } from './config/env'
import { RabbitMQConnectionError } from './errors/rabbitMQ-connection-error'
import { changeOrderFileStatusHttp } from './http/order-files/change-order-file-status'
import { getOrderFileHttp } from './http/order-files/get-order-file'
import { makeStorageService } from './services/storage/make-storage-service'
class ProcessFilesWorker {
  private connection: amqp.Connection | null = null
  private consumerChannel: amqp.Channel | null = null
  private producerChannel: amqp.Channel | null = null
  private processFilesQueue = env.QUEUE_NAME
  private processFilesQueueDLQ = `${env.QUEUE_NAME}.DQL`
  private processRowsQueue = env.ROW_PROCESSING_QUEUE

  private async createConnection() {
    try {
      this.connection = await amqp.connect(env.RABBITMQ_URL)
      await this.onConnectionClose()
    } catch (error) {
      setTimeout(() => this.createConnection(), 5000) // Tentar novamente após 5 segundos
    }
  }

  private async onConnectionClose() {
    if (this.connection) {
      this.connection.on('close', async () => {
        this.connection = null
        this.consumerChannel = null
        this.producerChannel = null
        await this.createConnection()
      })
    }
  }

  private async createChannels() {
    if (!this.connection) throw new RabbitMQConnectionError()
    this.consumerChannel = await this.connection.createChannel()
    this.consumerChannel.prefetch(5)
    this.producerChannel = await this.connection.createChannel()
  }

  private async assertQueues() {
    if (!this.connection) throw new RabbitMQConnectionError()
    if (!this.consumerChannel)
      throw new RabbitMQConnectionError(
        'RabbitMQ consumer channel is not initialized.',
      )
    if (!this.producerChannel)
      throw new RabbitMQConnectionError(
        'RabbitMQ producer channel is not initialized.',
      )
    await this.consumerChannel.assertQueue(this.processFilesQueue, {
      durable: true,
    })
    await this.producerChannel.assertQueue(this.processFilesQueueDLQ, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60, // 1 hora
      },
    })
    await this.producerChannel.assertQueue(this.processRowsQueue, {
      durable: true,
    })
  }

  async sendToDLDQueue(content: Buffer<ArrayBufferLike>) {
    this.producerChannel?.sendToQueue(this.processFilesQueueDLQ, content, {
      persistent: true,
    })
  }

  async handleProcessMensagemError(content: Buffer<ArrayBufferLike>) {
    this.sendToDLDQueue(content)
  }

  async run() {
    await this.createConnection()
    await this.createChannels()
    await this.assertQueues()
    if (!this.connection) throw new RabbitMQConnectionError()
    if (!this.consumerChannel)
      throw new RabbitMQConnectionError(
        'RabbitMQ consumer channel is not initialized.',
      )
    if (!this.producerChannel)
      throw new RabbitMQConnectionError(
        'RabbitMQ producer channel is not initialized.',
      )

    console.log(`Aguardando mensagens na fila: ${this.processFilesQueue}`)

    this.consumerChannel.consume(this.processFilesQueue, async (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString()) as {
          order_file_id: number
        }
        const { order_file_id: orderFileId } = content
        try {
          const {
            order_file: { bucket, key },
          } = await getOrderFileHttp({ orderFileId: Number(orderFileId) })

          const storage = makeStorageService()
          const body = await storage.download({
            bucket,
            key,
          })

          if (!body) {
            await changeOrderFileStatusHttp({
              orderFileId: Number(orderFileId),
              status: 'PROCESSING_ERROR',
              error: 'Unable to fetch file from s3.',
            })
            return this.consumerChannel?.ack(msg)
          }

          const rl = readline.createInterface({
            input: body,
            crlfDelay: Infinity,
          })

          console.log('Lendo arquivo linha por linha:')

          for await (const line of rl) {
            this.producerChannel?.sendToQueue(
              this.processRowsQueue,
              Buffer.from(JSON.stringify(line)),
              {
                persistent: true,
              },
            )
            console.log(line)
          }

          await changeOrderFileStatusHttp({
            orderFileId: Number(orderFileId),
            status: 'PROCESSED',
          })

          console.log(`Mensagem recebida: ${msg.content.toString()}`)
          return this.consumerChannel?.ack(msg)
        } catch (error) {
          console.log(error)
          await changeOrderFileStatusHttp({
            orderFileId: Number(orderFileId),
            status: 'PROCESSING_ERROR',
            error: 'Unknown error while trying to process file.',
          })
          this.handleProcessMensagemError(msg.content)
          return this.consumerChannel?.ack(msg)
        }
      }
    })
  }

  async close() {
    try {
      if (!this.connection)
        throw new RabbitMQConnectionError('RabbitMQ is not initialized.')
      if (!this.consumerChannel)
        throw new RabbitMQConnectionError(
          'RabbitMQ consumer channel is not initialized.',
        )
      if (!this.producerChannel)
        throw new RabbitMQConnectionError(
          'RabbitMQ producer channel is not initialized.',
        )
      await this.producerChannel.close()
      await this.consumerChannel.close()
      await this.connection.close()
      console.log('RabbitMQ connection closed.')
    } catch (error) {
      console.error('Failed to close RabbitMQ connection:', error)
    }
  }
}

export const processFilesWorker = new ProcessFilesWorker()
