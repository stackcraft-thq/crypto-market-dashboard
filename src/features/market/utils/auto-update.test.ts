import { describe, expect, it } from 'vitest'
import { ApiError } from '../api/api-error'
import { autoUpdateInterval } from './auto-update'

describe('auto-update policy', () => {
  it('uses the selected cadence without shortening a server cooldown', () => {
    expect(autoUpdateInterval(true, null, 0, 120_000)).toBe(120_000)
    expect(autoUpdateInterval(true, null, 0, 300_000)).toBe(300_000)
    expect(autoUpdateInterval(true, new ApiError('limit', 429, 600_000), 0, 300_000)).toBe(600_000)
  })
  it('is opt-in and updates every minute when healthy', () => {
    expect(autoUpdateInterval(false, null)).toBe(false)
    expect(autoUpdateInterval(true, null)).toBe(60_000)
  })
  it('waits for long rate limits and never polls more than once a minute', () => {
    expect(autoUpdateInterval(true, new ApiError('limit', 429, 180_000), 0)).toBe(180_000)
    expect(autoUpdateInterval(true, new ApiError('limit', 429, 30_000), 0)).toBe(60_000)
    expect(autoUpdateInterval(false, new ApiError('limit', 429, 180_000), 0)).toBe(false)
  })
  it('pauses other failures until recovery instead of repeatedly hitting a failing API', () => {
    expect(autoUpdateInterval(true, new ApiError('network', 0))).toBe(false)
    expect(autoUpdateInterval(true, new ApiError('client', 403))).toBe(false)
    expect(autoUpdateInterval(true, new Error('invalid data'))).toBe(false)
  })
})
