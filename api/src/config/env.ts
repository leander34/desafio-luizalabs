import 'dotenv/config'

// import { config } from 'dotenv'
import { z } from 'zod'

// if (process.env.NODE_ENV === 'test') {
//   config({ path: '.env.test' })
// } else {
//   config()
// }

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string({ required_error: 'DATABASE_URL is missing' }).url(),
  RABBITMQ_URL: z.string({ required_error: 'RABBITMQ_URL is missing' }).url(),
  PORT: z.coerce.number().default(3000),
  QUEUE_PROCESS_FILES: z.string({
    required_error: 'QUEUE_PROCESS_FILES is missing',
  }),
  QUEUE_PROCESS_ROWS: z.string({
    required_error: 'QUEUE_PROCESS_ROWS is missing',
  }),
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
  REDIS_HOST: z.string().optional().default('127.0.0.1'),
  REDIS_PORT: z.coerce.number().optional().default(6379),
  REDIS_DB: z.coerce.number().optional().default(0),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('‼⚠‼ Invalid enviroment variables', _env.error.format())
  throw new Error('Invalid enviroment variables')
}

export const env = _env.data
