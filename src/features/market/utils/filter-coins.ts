import type { Coin } from '../types/coin'
import type { SortOrder } from '../types/sort'

export function filterCoins(coins: Coin[], search: string, sort: SortOrder): Coin[] {
  const term = search.trim().toLowerCase()
  const field = sort.startsWith('price') ? 'current_price'
    : sort.startsWith('change') ? 'price_change_percentage_24h' : 'market_cap'
  const direction = sort.endsWith('asc') ? 1 : -1
  return coins
    .filter((coin) => coin.name.toLowerCase().includes(term) || coin.symbol.toLowerCase().includes(term))
    .sort((a, b) => {
      const first = a[field]
      const second = b[field]
      // Unavailable values belong last in either direction.
      if (first === null && second === null) return a.name.localeCompare(b.name)
      if (first === null) return 1
      if (second === null) return -1
      return (first - second) * direction || a.name.localeCompare(b.name)
    })
}
