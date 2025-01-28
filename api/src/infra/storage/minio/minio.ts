import { randomUUID } from 'node:crypto'

import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

import { env } from '@/config/env'
import { BadRequestError } from '@/core/errors/bad-request-error'

import type { StorageService, UploadParams } from '../interface'

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

  async createBucketIfNotExists(bucket: string) {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucket }))
    } catch (error) {
      if (
        error instanceof S3ServiceException &&
        (error.name === 'NotFound' || error.name === 'NoSuchBucket')
      ) {
        try {
          await this.s3Client.send(new CreateBucketCommand({ Bucket: bucket }))
          return
        } catch (createError) {
          throw new BadRequestError('Unable to create bucket.', 'file')
        }
      }
      throw new BadRequestError('Unable to create bucket.', 'file')
    }
  }

  async upload({ body, filename, mimetype, bucket }: UploadParams) {
    const key = `${randomUUID()}_${filename.replace(' ', '')}`
    const usedBucket = bucket ?? env.STORAGE_BUCKET_NAME
    await this.createBucketIfNotExists(usedBucket)

    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: usedBucket,
          Key: key,
          Body: body,
          ContentType: mimetype,
        },
      })
      await upload.done()
      return {
        bucket: usedBucket,
        key,
      }
    } catch (error) {
      throw new BadRequestError('Unable to save the file.', 'file')
    }
  }
}
