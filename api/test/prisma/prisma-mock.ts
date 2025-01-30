import { PrismaClient } from '@prisma/client'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>()

beforeEach(() => {
  mockReset(prismaMock)
  vi.resetAllMocks()
  vi.clearAllMocks()
})

export type PrismaMockType = DeepMockProxy<PrismaClient>
