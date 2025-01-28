import { MinioStorage } from './minio/minio'

export const providers = {
  MINIO: new MinioStorage(),
}
