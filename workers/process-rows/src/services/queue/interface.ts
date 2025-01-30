import * as amqp from 'amqplib'

export interface StartParms {
  consumerPrefetch?: number
  producerPrefetch?: number
}

export interface QueueService {
  start(params?: StartParms): Promise<void>
  createConnection(): Promise<void>
  createConsumerChannel(prefetch?: number): Promise<void>
  createProducerChannel(prefetch?: number): Promise<void>
  assertQueue(
    channel: 'CONSUMER' | 'PRODUCER',
    queueName: string,
    options: amqp.Options.AssertQueue,
  ): Promise<void>

  sendToQueue(
    queueName: string,
    content: Buffer,
    options: amqp.Options.Publish,
  ): void

  consume(
    queueName: string,
    onMessage: (msg: amqp.Message) => Promise<void>,
  ): void

  confirmAck(msg: amqp.Message): void

  close(): Promise<void>
}
