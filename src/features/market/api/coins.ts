import { ApiError } from './api-error'
import { parseCoins } from './coin-validation'
import type { Coin } from '../types/coin'

export const MARKETS_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'

// Shared across observers: even manual requests must respect a server cooldown.
let rateLimitUntil = 0

export function retryAfterDeadline(header: string | null, now = Date.now()): number {
  const seconds = header === null ? NaN : Number(header)
  const deadline = Number.isFinite(seconds) ? now + seconds * 1_000 : Date.parse(header ?? '')
  return Math.max(now + 60_000, Number.isFinite(deadline) ? deadline : 0)
}

export async function fetchCoins(signal: AbortSignal): Promise<Coin[]> {
  if (rateLimitUntil > Date.now()) {
    throw new ApiError('CoinGecko is receiving too many requests. Please wait before trying again.', 429, rateLimitUntil)
  }
  let response: Response
  try {
    response = await fetch(MARKETS_URL, {
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
      headers: { Accept: 'application/json' },
    })
  } catch (error) {
    if (signal.aborted) throw error
    throw new ApiError('CoinGecko could not be reached. This may be a temporary service, rate-limit, or connection issue. Please wait a minute and try again.', 0, null, { cause: error })
  }
  if (!response.ok) {
    if (response.status === 429) {
      rateLimitUntil = retryAfterDeadline(response.headers.get('Retry-After'))
      throw new ApiError('CoinGecko is receiving too many requests. Please wait before trying again.', 429, rateLimitUntil)
    }
    throw new ApiError(
      response.status >= 500
        ? 'CoinGecko is temporarily unavailable. Please try again shortly.'
        : `CoinGecko could not complete the request (HTTP ${response.status}). Please try again later.`,
      response.status,
    )
  }
  let payload: unknown
  try {
    payload = await response.json()
  } catch (error) {
    if (signal.aborted) throw error
    if (error instanceof SyntaxError) throw new Error('CoinGecko returned unreadable data. Please try again later.', { cause: error })
    throw new ApiError('The connection was interrupted while downloading prices. Please try again.', 0, null, { cause: error })
  }
  return parseCoins(payload)
}
