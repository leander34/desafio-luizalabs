import { BaseError } from './base-error'

export class RabbitMQConnectionError extends BaseError {
  constructor(
    message = 'Rabbitmq connection not established.',
    path = 'rabbitMQ',
  ) {
    super(400, message, path, 'RabbitMQ Connection Error')
  }
}
