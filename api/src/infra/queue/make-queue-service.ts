import { RabbitMQService } from './rabbitmq/rabbitmq'

export async function makeQueueService(uri: string) {
  return RabbitMQService.getInstance(uri)
}
