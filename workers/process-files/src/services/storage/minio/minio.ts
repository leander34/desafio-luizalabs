import type { Readable } from 'node:stream'

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { env } from '@/config/env'

import type { DownloadParams, StorageService } from '../interface'

export class MinioStorage implements StorageService {
  private s3Client = new S3Client({
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
  })

  async download({ bucket, key }: DownloadParams): Promise<Readable> {
    const usedBucket = bucket ?? env.STORAGE_BUCKET_NAME

    const command = new GetObjectCommand({
      Bucket: usedBucket,
      Key: key,
    })

    const { Body } = await this.s3Client.send(command)
    return Body as Readable
  }
}
