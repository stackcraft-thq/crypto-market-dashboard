import { ArrowUpRight, ChartNoAxesCombined, Layers, Trophy } from 'lucide-react'
import { formatCompactUsd } from '../../../shared/utils/format'
import type { Coin } from '../types/coin'
import { marketSummary } from '../utils/market-summary'
import { PercentageChange } from './percentage-change'
import { MarketBreadth } from './market-breadth'
import { CoinIcon } from './coin-icon'

export function MarketOverview({ coins, loading }: { coins: Coin[] | undefined; loading: boolean }) {
  const summary = marketSummary(coins ?? [])
  const ready = coins !== undefined && coins.length > 0
  return (
    <section className="overview-grid" aria-label="Overview of the fetched top 20 coins">
      <div className="overview-card">
        <div className="overview-label"><span>Combined market cap</span><Layers size={17} aria-hidden="true" /></div>
        <p className={loading ? 'skeleton overview-placeholder' : 'overview-value'}>{loading ? '' : ready ? formatCompactUsd(summary.marketCap) : '—'}</p>
        <span className="overview-caption">Across the fetched top {coins?.length ?? 20} coins</span>
      </div>
      <div className="overview-card">
        <div className="overview-label"><span>24h trading volume</span><ChartNoAxesCombined size={18} aria-hidden="true" /></div>
        <p className={loading ? 'skeleton overview-placeholder' : 'overview-value'}>{loading ? '' : ready ? formatCompactUsd(summary.volume) : '—'}</p>
        <span className="overview-caption">Across the fetched top {coins?.length ?? 20} coins</span>
      </div>
      <div className="overview-card">
        <div className="overview-label"><span>Coins on the rise</span><ArrowUpRight size={19} aria-hidden="true" /></div>
        <p className={loading ? 'skeleton overview-placeholder' : 'overview-value'}>{loading ? '' : ready && summary.knownChanges > 0 ? <>{summary.gainers}<span className="overview-value-sub"> / {summary.knownChanges}</span></> : '—'}</p>
        {loading ? <span className="skeleton breadth-placeholder" /> : <MarketBreadth rising={summary.gainers} falling={summary.losers} unchanged={summary.unchanged} unavailable={summary.unavailable} />}
      </div>
      <div className="overview-card overview-highlight">
        <div className="overview-label"><span>Best 24h performer</span><Trophy size={17} aria-hidden="true" /></div>
        <p className={loading ? 'skeleton overview-placeholder' : 'overview-value best-performer'}>{loading ? '' : summary.best ? <><CoinIcon src={summary.best.image} symbol={summary.best.symbol} /><span title={summary.best.name}>{summary.best.name}</span></> : '—'}</p>
        <div className="overview-caption">{summary.best ? <><PercentageChange value={summary.best.price_change_percentage_24h} /><span>Fetched top {coins?.length ?? 20}</span></> : 'Among fetched coins with known change'}</div>
      </div>
    </section>
  )
}
