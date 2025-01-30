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
  ROW_PROCESSING_QUEUE: z.string({
    required_error: 'ROW_PROCESSING_QUEUE is missing',
  }),
  API_URL: z
    .string({ required_error: 'API_URL is missing' })
    .url({ message: 'Invalid API_URL' }),
  STORAGE_PROVIDER: z.string().default('MINIO'),
  STORAGE_ENDPOINT: z.string().default('minio'),
  STORAGE_PORT: z.coerce.number().default(9000),
  STORAGE_ACCESS_KEY: z
    .string({
      required_error: 'STORAGE_ACCESS_KEY is missing',
    })
    .min(5),
  STORAGE_SECRET_KEY: z
    .string({
      required_error: 'STORAGE_SECRET_KEY is missing',
    })
    .min(5),
  STORAGE_BUCKET_NAME: z.string().default('desafio-labs'),
  STORAGE_REGION: z.string({
    required_error: 'STORAGE_REGION is missing',
  }),
})
const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('‼⚠‼ Invalid enviroment variables', _env.error.format())
  throw new Error('Invalid enviroment variables')
}

export const env = _env.data
