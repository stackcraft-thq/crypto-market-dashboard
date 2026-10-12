import { ArrowDownUp, Search, X } from 'lucide-react'
import { SORT_OPTIONS } from '../types/sort'
import { Dropdown } from '../../../shared/components/dropdown'
import type { MarketToolbarProps } from '../types/market-toolbar'

export function MarketToolbar({ search, sort, onSearch, onSort }: MarketToolbarProps) {
  return (
    <div className="market-toolbar">
      <div className="search-field">
        <Search size={18} aria-hidden="true" />
        <label className="sr-only" htmlFor="coin-search">Search coins by name or symbol</label>
        <input id="coin-search" type="search" placeholder="Search coins by name or symbol…" value={search} onChange={(event) => onSearch(event.target.value)} autoComplete="off" />
        {search && <button className="clear-search" onClick={() => onSearch('')} aria-label="Clear search"><X size={16} aria-hidden="true" /></button>}
      </div>
      <Dropdown label="Sort coins" value={sort} options={SORT_OPTIONS} onChange={onSort} icon={<ArrowDownUp size={16} />} className="sort-field" />
    </div>
  )
}
