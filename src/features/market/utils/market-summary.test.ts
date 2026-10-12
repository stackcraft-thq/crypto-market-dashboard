import { describe, expect, it } from 'vitest'
import { testCoins } from '../../../test/fixtures/coins'
import { marketSummary } from './market-summary'

describe('market overview', () => {
  it('aggregates only the fetched dataset', () => {
    const result = marketSummary(testCoins)
    expect(result.marketCap).toBe(1_800_000_000_000)
    expect(result.volume).toBe(76_000_000_000)
    expect(result.gainers).toBe(1)
    expect(result.losers).toBe(1)
    expect(result.unchanged).toBe(1)
    expect(result.unavailable).toBe(0)
    expect(result.best?.id).toBe('bitcoin')
  })
  it('does not present incomplete sums as complete totals', () => {
    const result = marketSummary([{ ...testCoins[0]!, market_cap: null, total_volume: null, price_change_percentage_24h: null }])
    expect(result.marketCap).toBeNull()
    expect(result.volume).toBeNull()
    expect(result.knownChanges).toBe(0)
    expect(result.unavailable).toBe(1)
    expect(result.best).toBeNull()
  })
  it('selects the least negative performer in a falling market', () => {
    const result = marketSummary(testCoins.map((coin, index) => ({ ...coin, price_change_percentage_24h: -index - 1 })))
    expect(result.best?.id).toBe('bitcoin')
  })
})
