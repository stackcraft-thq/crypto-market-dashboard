import type { SortOrder } from './sort'

export interface MarketToolbarProps {
  search: string
  sort: SortOrder
  onSearch: (value: string) => void
  onSort: (value: SortOrder) => void
}
