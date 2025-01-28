export class BaseError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public path: string,
    public errorName: string,
  ) {
    super(message)
  }

  getBody() {
    return {
      message: this.errorName,
      errors: [
        {
          path: this.path,
          message: this.message,
        },
      ],
    }
  }
}
