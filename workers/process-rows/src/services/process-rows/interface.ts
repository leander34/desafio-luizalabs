import * as amqp from 'amqplib'
export interface ProcessRowsService {
  run(): Promise<void>
  sendToDLDQueue(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.Options.Publish['headers'],
  ): Promise<void>
  handleProcessMensagemError(
    content: Buffer<ArrayBufferLike>,
    headers: amqp.MessagePropertyHeaders,
    retries: number,
  ): Promise<void>
}
