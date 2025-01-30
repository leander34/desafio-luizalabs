import { MinioStorage } from './minio/minio'
import { s3Client } from './s3-client'
export const providers = {
  MINIO: new MinioStorage(s3Client),
} as const
