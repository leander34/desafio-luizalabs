export class ValidationError extends Error {
  public statusCode = 400
  constructor(
    private errors: {
      path: string
      message: string
    }[],
  ) {
    super('Validation error')
  }

  getBody(): { message: string; errors: { path: string; message: string }[] } {
    return {
      message: this.message,
      errors: this.errors,
    }
  }
}
