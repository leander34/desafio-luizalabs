import { BaseError } from '@/core/errors/base-error'
import { InternalServerError } from '@/core/errors/internal-server-error'

export function normalizeError(err: Error) {
  if (err instanceof BaseError) {
    return err
  }

  return new InternalServerError(err)
}
