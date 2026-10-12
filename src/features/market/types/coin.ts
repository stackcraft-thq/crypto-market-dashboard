/** Fields consumed from CoinGecko's /coins/markets response. */
export interface Coin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number | null
  market_cap: number | null
  market_cap_rank: number | null
  total_volume: number | null
  price_change_percentage_24h: number | null
  last_updated: string | null
}
