import { beforeEach, describe, expect, it, vi } from 'vitest'
import { testCoins } from '../../../test/fixtures/coins'
import { parseCoins } from './coin-validation'

describe('API boundary', () => {
  beforeEach(() => vi.resetModules())

  it('accepts valid nullable data and ignores unused response fields', () => {
    expect(parseCoins([{ ...testCoins[0], current_price: null, unused: 42 }])[0]?.current_price).toBeNull()
  })
  it.each([{}, [{ id: 'broken' }], [{ ...testCoins[0], current_price: 'wrong' }], [testCoins[0], testCoins[0]]])('rejects malformed or duplicate responses', (input) => {
    expect(() => parseCoins(input)).toThrow()
  })
  it('passes cancellation and the required endpoint to fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(testCoins)))
    vi.stubGlobal('fetch', fetchMock)
    const { fetchCoins, MARKETS_URL } = await import('./coins')
    expect(await fetchCoins(new AbortController().signal)).toEqual(testCoins)
    expect(fetchMock).toHaveBeenCalledWith(MARKETS_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }))
  })
  it('handles network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const { fetchCoins } = await import('./coins')
    await expect(fetchCoins(new AbortController().signal)).rejects.toMatchObject({ status: 0 })
  })
  it('gives a readable message for an invalid JSON body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json')))
    const { fetchCoins } = await import('./coins')
    await expect(fetchCoins(new AbortController().signal)).rejects.toThrow('CoinGecko returned unreadable data')
  })
  it('enforces rate-limit cooldown without making another request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 429, headers: { 'Retry-After': '120' } }))
    vi.stubGlobal('fetch', fetchMock)
    const { fetchCoins } = await import('./coins')
    await expect(fetchCoins(new AbortController().signal)).rejects.toMatchObject({ status: 429 })
    await expect(fetchCoins(new AbortController().signal)).rejects.toMatchObject({ status: 429 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('parses seconds, HTTP dates, and invalid Retry-After headers conservatively', async () => {
    const { retryAfterDeadline } = await import('./coins')
    const now = Date.parse('2026-01-01T00:00:00Z')
    expect(retryAfterDeadline('120', now)).toBe(now + 120_000)
    expect(retryAfterDeadline('Thu, 01 Jan 2026 00:03:00 GMT', now)).toBe(now + 180_000)
    expect(retryAfterDeadline(null, now)).toBe(now + 60_000)
    expect(retryAfterDeadline('invalid', now)).toBe(now + 60_000)
  })
})
