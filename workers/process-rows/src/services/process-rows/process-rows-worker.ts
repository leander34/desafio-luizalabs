import * as amqp from 'amqplib'

import { env } from '@/config/env'
import { CouldNotFindOrCreateEntityError } from '@/errors/could-not-find-or-create-entity-error'
import { InvalidFieldFormatError } from '@/errors/invalid-field-format-error'
import { processLine } from '@/utils/process-line'

import type { ICustomerService } from '../customer/interface'
import type { IOrderService } from '../order/interface'
import type { QueueService } from '../queue/interface'
import type { ProcessRowsService } from './interface'
export class ProcessRowsWorkerService implements ProcessRowsService {
  private processRowsQueue = env.QUEUE_NAME
  private processRowsQueueDLQ = `${env.QUEUE_NAME}.DLQ`
  private processRowsQueueRetry = `${env.QUEUE_NAME}.RETRY`
  private MAX_RETRIES = 5
  constructor(
    private queueService: QueueService,
    private customerService: ICustomerService,
    private orderService: IOrderService,
  ) {}

  async sendToDLDQueue(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.Options.Publish['headers'] = {},
  ) {
    this.queueService.sendToQueue(this.processRowsQueueDLQ, content, {
      persistent: true,
      headers,
    })
  }

  async handleProcessMensagemError(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.MessagePropertyHeaders,
    retries: number,
  ) {
    if (retries < this.MAX_RETRIES) {
      headers.retries = retries + 1
      this.queueService.sendToQueue(this.processRowsQueueRetry, content, {
        headers,
        persistent: true,
      })
    } else {
      this.sendToDLDQueue(content)
    }
  }

  async run(): Promise<void> {
    await this.queueService.start({ consumerPrefetch: 10 })
    await this.queueService.assertQueue('CONSUMER', this.processRowsQueue, {
      durable: true,
    })
    await this.queueService.assertQueue('PRODUCER', this.processRowsQueueDLQ, {
      durable: true,
      arguments: {
        'x-message-ttl': 1000 * 60 * 60, // 1 hora
      },
    })
    await this.queueService.assertQueue(
      'PRODUCER',
      this.processRowsQueueRetry,
      {
        durable: true,
        arguments: {
          'x-message-ttl': 1000 * 10, // Mensagem ficará 10 segundos na "PROCESS.ROWS.RETRY"
          'x-dead-letter-exchange': '', // Sem exchange - retorna à fila "PROCESS.ROWS"
          'x-dead-letter-routing-key': this.processRowsQueue, // Redireciona para a fila "PROCESS.ROWS"
        },
      },
    )
    console.log(`Waiting for messages in the queue: ${this.processRowsQueue}`)

    this.queueService.consume(this.processRowsQueue, async (msg) => {
      const headers = msg.properties.headers || {}
      const retries = headers.retries || 0

      try {
        const content = JSON.parse(msg.content.toString())
        if (String(content).length !== 95) {
          await this.sendToDLDQueue(msg.content)
          return this.queueService.confirmAck(msg)
        }
        const { customerId, name, orderId, date, productId, value } =
          processLine(content)

        const customer = await this.customerService.findOrCreateCustomer({
          customerId,
          name,
        })

        if (!customer) {
          throw new CouldNotFindOrCreateEntityError(
            'An unexpected error occurred while trying to find or create the customer.',
          )
        }

        const order = await this.orderService.findOrCreateOrder({
          orderId,
          date,
          customerId: customer.user_id,
        })

        if (!order) {
          throw new CouldNotFindOrCreateEntityError(
            'An unexpected error occurred while trying to find or create the order.',
          )
        }

        const orderProduct = await this.orderService.addOrderProduct({
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
        return this.queueService.confirmAck(msg)
      } catch (error) {
        if (error instanceof InvalidFieldFormatError) {
          this.sendToDLDQueue(msg.content)
          return this.queueService.confirmAck(msg)
        }
        this.handleProcessMensagemError(msg.content, headers, retries)
        return this.queueService.confirmAck(msg)
      }
    })
  }
}
