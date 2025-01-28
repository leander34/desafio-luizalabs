import { BaseError } from '@/core/errors/base-error'

export class ResourceNotFoundError extends BaseError {
  constructor(message: string, path: string) {
    super(404, message, path, 'Resource not found error')
  }
}
