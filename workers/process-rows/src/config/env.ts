import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  RABBITMQ_URL: z.string({ required_error: 'RABBITMQ_URL is missing' }).url(),
  QUEUE_NAME: z.string({ required_error: 'QUEUE_NAME is missing' }),
  API_URL: z
    .string({ required_error: 'API_URL is missing' })
    .url({ message: 'Invalid API_URL' }),
})
const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('‼⚠‼ Invalid enviroment variables', _env.error.format())
  throw new Error('Invalid enviroment variables')
}

export const env = _env.data
