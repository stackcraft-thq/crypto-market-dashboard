import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/api-error'
import { marketQueryOptions } from './use-market'

describe('retry policy', () => {
  it('retries only transient failures, at most twice', () => {
    const retry = marketQueryOptions.retry
    if (typeof retry !== 'function') throw new Error('Expected a retry policy')
    expect(retry(0, new ApiError('network', 0))).toBe(true)
    expect(retry(1, new ApiError('server', 503))).toBe(true)
    expect(retry(2, new ApiError('server', 503))).toBe(false)
    expect(retry(0, new ApiError('rate limit', 429))).toBe(false)
    expect(retry(0, new ApiError('forbidden', 403))).toBe(false)
    expect(retry(0, new Error('malformed response'))).toBe(false)
  })
})
