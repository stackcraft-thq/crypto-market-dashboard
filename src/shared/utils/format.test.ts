import { describe, expect, it } from 'vitest'
import { formatChange, formatCompactUsd, formatPrice } from './format'

describe('USD price formatting', () => {
  it('formats large and ordinary prices with grouping', () => {
    expect(formatPrice(65000.125)).toBe('$65,000.13')
    expect(formatPrice(0)).toBe('$0.00')
    expect(formatPrice(1)).toBe('$1.00')
  })
  it('preserves meaningful precision for small nonzero prices', () => {
    expect(formatPrice(0.00001234)).toBe('$0.0000123')
    expect(formatPrice(0.000000000123)).toBe('$1.23e-10')
    expect(formatPrice(0.5)).toBe('$0.50')
  })
  it('handles unavailable or invalid values honestly', () => {
    expect(formatPrice(null)).toBe('Unavailable')
    expect(formatPrice(NaN)).toBe('Unavailable')
    expect(formatCompactUsd(null)).toBe('Unavailable')
  })
  it('formats compact market totals', () => expect(formatCompactUsd(1_500_000_000)).toBe('$1.5B'))
})

describe('percentage formatting', () => {
  it.each([[2.5, '+2.50%'], [-1.2, '−1.20%'], [0, '0.00%'], [null, 'Unavailable'], [0.001, '+<0.01%'], [-0.001, '−<0.01%']])('formats %s as %s', (value, result) => {
    expect(formatChange(typeof value === 'number' ? value : null)).toBe(result)
  })
})
