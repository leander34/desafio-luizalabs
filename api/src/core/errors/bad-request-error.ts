import { BaseError } from '@/core/errors/base-error'

export class BadRequestError extends BaseError {
  constructor(message: string, path: string) {
    super(400, message, path, 'Bad Request Error')
  }
}
