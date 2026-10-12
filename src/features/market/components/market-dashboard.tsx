import { useMemo, useState } from 'react'
import { CircleHelp, RefreshCw, WifiOff, AlertCircle } from 'lucide-react'
import { useOnline } from '../../../shared/hooks/use-online'
import { useClock } from '../../../shared/hooks/use-clock'
import { formatUpdateTime } from '../../../shared/utils/format'
import { ApiError } from '../api/api-error'
import { useMarket } from '../hooks/use-market'
import type { SortOrder } from '../types/sort'
import { filterCoins } from '../utils/filter-coins'
import { CoinCard } from './coin-card'
import { MarketOverview } from './market-overview'
import { MarketSkeleton } from './market-skeleton'
import { MarketState } from './market-state'
import { MarketToolbar } from './market-toolbar'
import { AutoUpdateToggle } from './auto-update-toggle'
import { useManualRefresh } from '../hooks/use-manual-refresh'
import { UpdateIntervalSelect } from './update-interval-select'
import type { UpdateInterval } from '../types/update-interval'

export function MarketDashboard() {
  const [autoUpdate, setAutoUpdate] = useState(false)
  const [updateInterval, setUpdateInterval] = useState<UpdateInterval>(60_000)
  const market = useMarket(autoUpdate, updateInterval)
  const online = useOnline()
  const now = useClock()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOrder>('market-cap')
  const coins = useMemo(() => filterCoins(market.data ?? [], search, sort), [market.data, search, sort])
  const hasData = market.data !== undefined
  const retryAt = market.error instanceof ApiError ? market.error.retryAt : null
  const serverCooldown = retryAt ? Math.max(0, Math.ceil((retryAt - now) / 1_000)) : 0
  const { refresh, cooldown, disabled: refreshDisabled } = useManualRefresh({
    now, online, busy: market.isFetching, serverRetryAt: retryAt,
    onRefresh: () => { void market.refetch({ cancelRefetch: false }) },
  })
  const stale = hasData && (market.isError || !online || now - market.dataUpdatedAt >= 120_000)

  return (
    <main id="main" className="container dashboard">
      <section className="dashboard-heading" aria-labelledby="dashboard-title">
        <div><div className="eyebrow"><span /> THE CRYPTO MARKET, AT A GLANCE</div><h1 id="dashboard-title">A clearer view of <span>crypto.</span></h1><p>Explore the top 20 cryptocurrencies. Less noise, more perspective.</p></div>
        <div className={`data-status ${stale || !online || market.isError ? 'status-warning' : ''}`}><span className="status-dot" />{!online ? 'Offline' : market.isFetching ? 'Updating prices' : market.isError ? 'Update unavailable' : hasData ? stale ? 'Refresh available' : 'Latest snapshot' : 'Connecting'}</div>
      </section>

      <MarketOverview coins={market.data} loading={market.isPending && online} />

      {!online && hasData && <div className="notice" role="status"><WifiOff size={18} aria-hidden="true" /><p>You’re offline. Showing the last available prices. We’ll reconnect automatically.</p></div>}
      {online && market.isError && hasData && <div className="notice" role="alert"><AlertCircle size={18} aria-hidden="true" /><p>Prices may be outdated. {market.error.message}</p><button className="text-button" onClick={refresh} disabled={refreshDisabled}>{cooldown > 0 ? `Retry in ${cooldown}s` : market.isFetching ? 'Retrying…' : 'Retry update'}</button></div>}

      <section className="market-section" aria-labelledby="market-title">
        <div className="market-section-heading">
          <div className="section-title"><h2 id="market-title">Market explorer</h2><span className="count-badge">Top 20</span></div>
          <div className="market-actions">
            <AutoUpdateToggle enabled={autoUpdate} interval={updateInterval} online={online} cooldown={serverCooldown} hasError={market.isError} onToggle={() => setAutoUpdate((enabled) => !enabled)} />
            {autoUpdate ? <UpdateIntervalSelect value={updateInterval} onChange={setUpdateInterval} />
              : <button className="button refresh-button" onClick={refresh} disabled={refreshDisabled} title={cooldown > 0 ? 'Refresh is available once per minute to avoid excessive requests.' : undefined}><RefreshCw size={15} className={market.isFetching ? 'spinning' : ''} aria-hidden="true" />{market.isFetching ? 'Refreshing…' : cooldown > 0 ? `Refresh in ${cooldown}s` : 'Refresh prices'}</button>}
          </div>
        </div>
        <MarketToolbar search={search} sort={sort} onSearch={setSearch} onSort={setSort} />
        <div className="results-row"><span role="status">{hasData ? <>Showing <strong>{coins.length}</strong> of {market.data.length} coins</> : market.isFetching ? 'Loading market data…' : 'Waiting for market data'}</span><span className="updated-at">{market.dataUpdatedAt > 0 ? <>{stale ? 'Last successful update' : 'Updated'} <time dateTime={new Date(market.dataUpdatedAt).toISOString()}>{formatUpdateTime(market.dataUpdatedAt)}</time></> : 'All prices in USD'}</span></div>
        <div className="sr-only" role="status">{market.isFetching && hasData ? 'Refreshing market prices. Existing prices remain visible.' : ''}</div>

        {!hasData && !online ? <MarketState kind="offline" onAction={refresh} />
          : !hasData && market.isPending ? <MarketSkeleton />
          : !hasData && market.isError ? <MarketState kind="error" message={market.error.message} onAction={refresh} disabled={refreshDisabled} cooldown={cooldown} />
          : market.data?.length === 0 ? <MarketState kind="no-data" onAction={refresh} disabled={refreshDisabled} />
          : coins.length === 0 ? <MarketState kind="empty" onAction={() => setSearch('')} />
          : <div className="coin-grid">{coins.map((coin) => <CoinCard key={coin.id} coin={coin} />)}</div>}
      </section>

      <div className="market-footnote"><CircleHelp size={15} aria-hidden="true" /><p>Ranked by market capitalization. {autoUpdate ? `Auto-update fetches a new snapshot every ${updateInterval / 60_000} minute${updateInterval === 60_000 ? '' : 's'}.` : 'Enable auto-update and choose a refresh interval.'}</p></div>
    </main>
  )
}
