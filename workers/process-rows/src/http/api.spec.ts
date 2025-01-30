import { describe, expect, it, vi } from 'vitest'

import { api } from './api'

vi.mock('@/config/env', () => ({
  env: {
    API_URL: 'http://api-url',
  },
}))

describe('API', () => {
  it('should verify if api is create base on env.API_URL', () => {
    expect(api.getUri()).toBe('http://api-url')
  })
})
