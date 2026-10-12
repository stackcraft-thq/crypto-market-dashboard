import type { Coin } from '../../features/market/types/coin'

// Synthetic data used only by tests; never imported by the running application.
export const testCoins: Coin[] = [
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'btc', image: '', current_price: 65000, market_cap: 1_300_000_000_000, market_cap_rank: 1, total_volume: 24_000_000_000, price_change_percentage_24h: 2.5, last_updated: '2026-01-01T00:00:00Z' },
  { id: 'ethereum', name: 'Ethereum', symbol: 'eth', image: '', current_price: 3200, market_cap: 380_000_000_000, market_cap_rank: 2, total_volume: 12_000_000_000, price_change_percentage_24h: -1.2, last_updated: '2026-01-01T00:00:00Z' },
  { id: 'tether', name: 'Tether', symbol: 'usdt', image: '', current_price: 1, market_cap: 120_000_000_000, market_cap_rank: 3, total_volume: 40_000_000_000, price_change_percentage_24h: 0, last_updated: '2026-01-01T00:00:00Z' },
]
