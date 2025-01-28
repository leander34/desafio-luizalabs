import type { Readable } from 'node:stream'

export interface DownloadParams {
  bucket: string
  key: string
}

export interface StorageService {
  download(params: DownloadParams): Promise<Readable>
}
