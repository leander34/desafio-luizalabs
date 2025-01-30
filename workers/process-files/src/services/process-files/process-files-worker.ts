import readline from 'node:readline/promises'

import { env } from '@/config/env'

import type { IOrderFileService } from '../order-file/interface'
import type { QueueService } from '../queue/interface'
import type { StorageService } from '../storage/interface'
import type { ProcessFilesService } from './interface'
export class ProcessFilesWorkerService implements ProcessFilesService {
  private processFilesQueue = env.QUEUE_NAME
  private processFilesQueueDLQ = `${env.QUEUE_NAME}.DLQ`
  private processRowsQueue = env.ROW_PROCESSING_QUEUE
  constructor(
    private queueService: QueueService,
    private storageService: StorageService,
    private orderFileService: IOrderFileService,
  ) {}

  async sendToDLDQueue(content: Buffer<ArrayBufferLike>) {
    this.queueService.sendToQueue(this.processFilesQueueDLQ, content, {
      persistent: true,
    })
  }

  async handleProcessMensagemError(content: Buffer<ArrayBufferLike>) {
    this.sendToDLDQueue(content)
  }

  async run(): Promise<void> {
    await this.queueService.start({ consumerPrefetch: 5 })
    await this.queueService.assertQueue('CONSUMER', this.processFilesQueue, {
      durable: true,
    })
    await this.queueService.assertQueue('PRODUCER', this.processFilesQueueDLQ, {
      durable: true,
      arguments: { 'x-message-ttl': 1000 * 60 * 60 },
    })
    await this.queueService.assertQueue('PRODUCER', this.processRowsQueue, {
      durable: true,
    })
    console.log(`Waiting for messages in the queue: ${this.processFilesQueue}`)

    this.queueService.consume(this.processFilesQueue, async (msg) => {
      const content = JSON.parse(msg.content.toString()) as {
        order_file_id: number
      }
      const { order_file_id: orderFileId } = content

      try {
        const {
          order_file: { bucket, key },
        } = await this.orderFileService.getOrderFile({
          orderFileId: Number(orderFileId),
        })

        const body = await this.storageService.download({
          bucket,
          key,
        })

        if (!body) {
          await this.orderFileService.changeOrderFileStatus({
            orderFileId: Number(orderFileId),
            status: 'PROCESSING_ERROR',
            error: 'Unable to fetch file from s3.',
          })
          return this.queueService.confirmAck(msg)
        }

        const rl = readline.createInterface({
          input: body,
          crlfDelay: Infinity,
        })

        console.log('Lendo arquivo linha por linha:')

        for await (const line of rl) {
          this.queueService.sendToQueue(
            this.processRowsQueue,
            Buffer.from(JSON.stringify(line)),
            {
              persistent: true,
            },
          )
          console.log(line)
        }

        await this.orderFileService.changeOrderFileStatus({
          orderFileId: Number(orderFileId),
          status: 'PROCESSED',
        })

        console.log(`Mensagem recebida: ${msg.content.toString()}`)
        return this.queueService.confirmAck(msg)
      } catch (error) {
        console.log(error)
        await this.orderFileService.changeOrderFileStatus({
          orderFileId: Number(orderFileId),
          status: 'PROCESSING_ERROR',
          error: 'Unknown error while trying to process file.',
        })
        this.handleProcessMensagemError(msg.content)
        return this.queueService.confirmAck(msg)
      }
    })
  }
}
