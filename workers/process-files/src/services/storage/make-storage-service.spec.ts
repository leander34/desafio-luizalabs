import { env } from '@/config/env'

import { makeStorageService } from './make-storage-service'
vi.mock('@/config/env', () => ({
  env: {
    STORAGE_PROVIDER: 'MINIO',
  },
}))

vi.mock('./providers', () => ({
  providers: {
    MINIO: 'MinioStorage',
    AWS: 'AWSStorage',
  },
}))

describe('make Storage Service', () => {
  it('should return the correct provider based on env.STORAGE_PROVIDER', () => {
    const result1 = makeStorageService()

    expect(result1).toBe('MinioStorage')
    env.STORAGE_PROVIDER = 'AWS'
    const result2 = makeStorageService()

    expect(result2).toBe('AWSStorage')
  })
})
