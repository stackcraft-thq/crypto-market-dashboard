import { describe, expect, it } from 'vitest'
import { testCoins } from '../../../test/fixtures/coins'
import type { SortOrder } from '../types/sort'
import { filterCoins } from './filter-coins'

describe('coin discovery', () => {
  it('searches names case-insensitively and trims whitespace', () => {
    expect(filterCoins(testCoins, '  BITc  ', 'market-cap').map((coin) => coin.id)).toEqual(['bitcoin'])
  })
  it('searches symbols', () => expect(filterCoins(testCoins, 'BTC', 'market-cap').map((coin) => coin.id)).toEqual(['bitcoin']))
  it('returns no matches for an unknown term', () => expect(filterCoins(testCoins, 'unknown', 'market-cap')).toEqual([]))
  const cases: [SortOrder, string[]][] = [
    ['market-cap', ['bitcoin', 'ethereum', 'tether']],
    ['price-desc', ['bitcoin', 'ethereum', 'tether']],
    ['price-asc', ['tether', 'ethereum', 'bitcoin']],
    ['change-desc', ['bitcoin', 'tether', 'ethereum']],
    ['change-asc', ['ethereum', 'tether', 'bitcoin']],
  ]
  it.each(cases)('sorts by %s', (sort, expected) => {
    expect(filterCoins(testCoins, '', sort).map((coin) => coin.id)).toEqual(expected)
  })
  it('never mutates the cached input', () => {
    const input = testCoins.map((coin) => ({ ...coin }))
    filterCoins(input, '', 'price-asc')
    expect(input).toEqual(testCoins)
  })
  it.each(['price-asc', 'price-desc'] as const)('places missing values last for %s', (sort) => {
    const missing = { ...testCoins[0]!, id: 'unknown', current_price: null }
    expect(filterCoins([missing, ...testCoins], '', sort).at(-1)?.id).toBe('unknown')
  })
})
