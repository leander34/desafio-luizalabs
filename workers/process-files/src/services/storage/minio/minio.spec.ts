import 'dotenv/config'

import { Readable } from 'node:stream'

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { MinioStorage } from './minio'
vi.mock('@aws-sdk/client-s3', () => ({
  GetObjectCommand: vi.fn(),
}))

describe('Minio Service', async () => {
  it('should download a file and return a Readable stream', async () => {
    const mockBody = {} as Readable
    const mockSend = vi.fn().mockResolvedValue({ Body: mockBody })
    const mockBucket = 'my-bucket'
    const mockKey = 'my-file.txt'

    const mockS3Client = { send: mockSend } as unknown as S3Client
    const minioStorage = new MinioStorage(mockS3Client)
    const result = await minioStorage.download({
      bucket: mockBucket,
      key: mockKey,
    })

    expect(result).toBe(mockBody)
    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(expect.any(GetObjectCommand))
  })
})
