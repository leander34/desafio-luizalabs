import { env } from './config/env'
import { RabbitMQConnectionError } from './errors/rabbitMQ-connection-error'
import { OrderFileService } from './services/order-file/order-file-service'
import { ProcessFilesWorkerService } from './services/process-files/process-files-worker'
import { RabbitMQService } from './services/queue/rabbitmq/rabbitmq'
import { makeStorageService } from './services/storage/make-storage-service'

const rabbitMQService = new RabbitMQService(env.RABBITMQ_URL)
const storageService = makeStorageService()
const orderFilesService = new OrderFileService()
const processFilesWorkerService = new ProcessFilesWorkerService(
  rabbitMQService,
  storageService,
  orderFilesService,
)

export async function runWorker() {
  try {
    await processFilesWorkerService.run()
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
