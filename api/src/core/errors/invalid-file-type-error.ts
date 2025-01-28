import { BaseError } from './base-error'

export class InvalidFileTypeError extends BaseError {
  constructor(message = 'Invalid file type.', path: 'file') {
    super(400, message, path, 'Invalid File Type Error')
  }
}
