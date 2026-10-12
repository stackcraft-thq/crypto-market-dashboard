export type SortOrder = 'market-cap' | 'price-desc' | 'price-asc' | 'change-desc' | 'change-asc'

export const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'market-cap', label: 'Market cap: high to low' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'change-desc', label: '24h change: high to low' },
  { value: 'change-asc', label: '24h change: low to high' },
]

export function isSortOrder(value: string): value is SortOrder {
  return SORT_OPTIONS.some((option) => option.value === value)
}
