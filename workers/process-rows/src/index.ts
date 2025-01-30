import { env } from './config/env'
import { RabbitMQConnectionError } from './errors/rabbitMQ-connection-error'
import { CustomerService } from './services/customer/customer-service'
import { OrderService } from './services/order/order-service'
import { ProcessRowsWorkerService } from './services/process-rows/process-rows-worker'
import { RabbitMQService } from './services/queue/rabbitmq/rabbitmq'

const rabbitMQService = new RabbitMQService(env.RABBITMQ_URL)
const customerService = new CustomerService()
const orderService = new OrderService()
const processRowsWorkerService = new ProcessRowsWorkerService(
  rabbitMQService,
  customerService,
  orderService,
)

export async function runWorker() {
  try {
    await processRowsWorkerService.run()
  } catch (e) {
    if (e instanceof RabbitMQConnectionError) {
      console.log(e)
      return console.log(e.message)
    }
    console.log('An unexpected error occurred.')
    console.log(e)
  }
}

runWorker()
