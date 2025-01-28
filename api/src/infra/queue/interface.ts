export interface QueueService {
  assertQueue(queueName: string): Promise<void>
  publish(queueName: string, message: any): Promise<void>
  close(): Promise<void>
}
