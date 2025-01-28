import { env } from '@/config/env'

import { providers } from './providers'
export function makeStorageService() {
  return providers[env.STORAGE_PROVIDER as keyof typeof providers]
}
