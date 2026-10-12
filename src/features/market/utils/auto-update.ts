import { ApiError } from '../api/api-error'
import type { UpdateInterval } from '../types/update-interval'

export const AUTO_UPDATE_INTERVAL = 60_000

/** Poll only when requested; wait out rate limits and stop on other errors. */
export function autoUpdateInterval(enabled: boolean, error: Error | null, now = Date.now(), interval: UpdateInterval = AUTO_UPDATE_INTERVAL): number | false {
  if (!enabled) return false
  if (error instanceof ApiError && error.status === 429 && error.retryAt !== null) {
    return Math.max(interval, error.retryAt - now)
  }
  return error ? false : interval
}
