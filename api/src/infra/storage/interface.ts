import type { Readable } from 'node:stream'

export interface UploadParams {
  body: string | Uint8Array | Buffer | Readable
  filename: string
  mimetype: string
  bucket?: string
}

export interface StorageService {
  upload(params: UploadParams): Promise<{ bucket: string; key: string }>
  createBucketIfNotExists(bucket: string): Promise<void>
}
