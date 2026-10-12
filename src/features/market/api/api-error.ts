export class ApiError extends Error {
  readonly status: number
  readonly retryAt: number | null

  constructor(message: string, status: number, retryAt: number | null = null, options?: ErrorOptions) {
    super(message, options)
    this.name = 'ApiError'
    this.status = status
    this.retryAt = retryAt
  }
}
