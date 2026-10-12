import type { Coin } from '../types/coin'

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === 'number' && Number.isFinite(value))
}

function isCoin(value: unknown): value is Coin {
  if (typeof value !== 'object' || value === null) return false
  return (
    'id' in value && typeof value.id === 'string' && value.id.length > 0 &&
    'symbol' in value && typeof value.symbol === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'image' in value && typeof value.image === 'string' &&
    'current_price' in value && isNullableNumber(value.current_price) &&
    'market_cap' in value && isNullableNumber(value.market_cap) &&
    'market_cap_rank' in value && isNullableNumber(value.market_cap_rank) &&
    'total_volume' in value && isNullableNumber(value.total_volume) &&
    'price_change_percentage_24h' in value && isNullableNumber(value.price_change_percentage_24h) &&
    'last_updated' in value && (value.last_updated === null || typeof value.last_updated === 'string')
  )
}

export function parseCoins(payload: unknown): Coin[] {
  if (!Array.isArray(payload) || !payload.every(isCoin)) {
    throw new Error('CoinGecko returned unexpected data. Please try again later.')
  }
  const coins = payload.slice(0, 20)
  if (new Set(coins.map((coin) => coin.id)).size !== coins.length) {
    throw new Error('CoinGecko returned duplicate coins. Please try again later.')
  }
  return coins
}
