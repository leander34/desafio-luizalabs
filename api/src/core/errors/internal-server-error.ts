import { BaseError } from './base-error'

export class InternalServerError extends BaseError {
  constructor(err: Error) {
    super(
      500,
      'Internal server error, please try again later.',
      'server',
      'Internal Server Error',
    )

    console.log({
      name: err.name,
      message: err.message,
      stackTrace: err.stack,
      level: 'fatal',
    })
  }
}
