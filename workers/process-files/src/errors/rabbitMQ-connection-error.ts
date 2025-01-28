export class RabbitMQConnectionError extends Error {
  constructor(message = 'Rabbitmq connection not established.') {
    super(message)
  }
}
