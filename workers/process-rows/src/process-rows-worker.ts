import amqp from 'amqplib'

import { env } from './config/env'
import { CouldNotFindOrCreateEntityError } from './errors/could-not-find-or-create-entity-error'
import { InvalidFieldFormatError } from './errors/invalid-field-format-error'
import { RabbitMQConnectionError } from './errors/rabbitMQ-connection-error'
import { addOrderProduct } from './utils/http/add-order-product'
import { findOrCreateCustomer } from './utils/http/find-or-create-customer'
import { findOrCreateOrder } from './utils/http/find-or-create-order'
import { processLine } from './utils/process-line'
class ProcessRowsWorker {
  private connection: amqp.Connection | null = null
  private consumerChannel: amqp.Channel | null = null
  private producerChannel: amqp.Channel | null = null
  private processRowsQueue = env.QUEUE_NAME
  private processRowsQueueDLQ = `${env.QUEUE_NAME}.DQL`
  private processRowsQueueRetry = `${env.QUEUE_NAME}.RETRY`
  private MAX_RETRIES = 5

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
    this.consumerChannel.prefetch(10)
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
    await this.consumerChannel.assertQueue(this.processRowsQueue, {
      durable: true,
    })
    await this.producerChannel.assertQueue(this.processRowsQueueDLQ, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60, // 1 hora
      },
    })
    await this.producerChannel.assertQueue(this.processRowsQueueRetry, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 10, // Mensagem ficará 10 segundos na "PROCESS.ROWS.RETRY"
        'x-dead-letter-exchange': '', // Sem exchange - retorna à fila "PROCESS.ROWS"
        'x-dead-letter-routing-key': this.processRowsQueue, // Redireciona para a fila "PROCESS.ROWS"
      },
    })
  }

  async sendToDLDQueue(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.Options.Publish['headers'] = {},
  ) {
    this.producerChannel?.sendToQueue(this.processRowsQueueDLQ, content, {
      headers,
      persistent: true,
    })
  }

  async handleProcessMensagemError(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.MessagePropertyHeaders,
    retries: number,
  ) {
    if (retries < this.MAX_RETRIES) {
      headers.retries = retries + 1
      this.producerChannel?.sendToQueue(this.processRowsQueueRetry, content, {
        headers,
        persistent: true,
      })
    } else {
      this.sendToDLDQueue(content, headers)
    }
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

    console.log(`Aguardando mensagens na fila: ${this.processRowsQueue}`)

    this.consumerChannel.consume(this.processRowsQueue, async (msg) => {
      if (msg !== null) {
        const headers = msg.properties.headers || {}
        const retries = headers.retries || 0

        try {
          const content = JSON.parse(msg.content.toString())
          if (String(content).length !== 95) {
            await this.sendToDLDQueue(msg.content)
            return this.consumerChannel?.ack(msg)
          }
          const { customerId, name, orderId, date, productId, value } =
            processLine(content)

          console.log({ customerId, name, orderId, date, productId, value })

          const customer = await findOrCreateCustomer({
            customerId,
            name,
          })

          if (!customer) {
            throw new CouldNotFindOrCreateEntityError(
              'An unexpected error occurred while trying to find or create the customer.',
            )
          }

          const order = await findOrCreateOrder({
            orderId,
            date,
            customerId: customer.user_id,
          })

          if (!order) {
            throw new CouldNotFindOrCreateEntityError(
              'An unexpected error occurred while trying to find or create the order.',
            )
          }

          const orderProduct = await addOrderProduct({
            orderId: order.order_id,
            productId,
            currentProductValue: value,
          })

          if (!orderProduct) {
            throw new CouldNotFindOrCreateEntityError(
              'An unexpected error occurred while trying to find or create the order.',
            )
          }

          console.log(`Mensagem recebida: ${msg.content.toString()}`)
          return this.consumerChannel?.ack(msg) // Confirma o recebimento da mensagem
        } catch (error) {
          if (error instanceof InvalidFieldFormatError) {
            this.sendToDLDQueue(msg.content)
            return this.consumerChannel?.ack(msg)
          }
          this.handleProcessMensagemError(msg.content, headers, retries)
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

export const processRowsWorker = new ProcessRowsWorker()
