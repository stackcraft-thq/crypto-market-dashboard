import type { Coin } from '../types/coin'

export function marketSummary(coins: Coin[]) {
  const allCapsKnown = coins.length > 0 && coins.every((coin) => coin.market_cap !== null)
  const allVolumesKnown = coins.length > 0 && coins.every((coin) => coin.total_volume !== null)
  const knownChanges = coins.filter((coin) => coin.price_change_percentage_24h !== null)
  const gainers = knownChanges.filter((coin) => (coin.price_change_percentage_24h ?? 0) > 0).length
  const losers = knownChanges.filter((coin) => (coin.price_change_percentage_24h ?? 0) < 0).length
  const best = knownChanges.reduce<Coin | null>((leader, coin) =>
    !leader || (coin.price_change_percentage_24h ?? 0) > (leader.price_change_percentage_24h ?? 0) ? coin : leader, null)
  return {
    marketCap: allCapsKnown ? coins.reduce((sum, coin) => sum + (coin.market_cap ?? 0), 0) : null,
    volume: allVolumesKnown ? coins.reduce((sum, coin) => sum + (coin.total_volume ?? 0), 0) : null,
    gainers, losers,
    unchanged: knownChanges.length - gainers - losers,
    unavailable: coins.length - knownChanges.length,
    knownChanges: knownChanges.length, best,
  }
}
