import { RabbitMQConnectionError } from './errors/rabbitMQ-connection-error'
import { processFilesWorker } from './process-files-worker'

processFilesWorker.run().catch((e) => {
  if (e instanceof RabbitMQConnectionError) {
    console.log(e)
    return console.log(e.message)
  }
  console.log('An unexpected error occurred.')
  console.log(e)
})
