import { formatCompactUsd, formatPrice } from '../../../shared/utils/format'
import type { Coin } from '../types/coin'
import { CoinIcon } from './coin-icon'
import { PercentageChange } from './percentage-change'

export function CoinCard({ coin }: { coin: Coin }) {
  return (
    <article className="coin-card" aria-label={`${coin.name} market data`}>
      <div className="coin-card-heading">
        <CoinIcon src={coin.image} symbol={coin.symbol} />
        <div className="coin-identity"><h3 title={coin.name}>{coin.name}</h3><span>{coin.symbol.toUpperCase()}</span></div>
        <span className="rank" aria-label={coin.market_cap_rank === null ? 'Rank unavailable' : `Market cap rank ${coin.market_cap_rank}`}>{coin.market_cap_rank === null ? '—' : `#${coin.market_cap_rank}`}</span>
      </div>
      <div className="coin-price-row"><p className="coin-price">{formatPrice(coin.current_price)}</p><span className="currency-label">USD</span></div>
      <div className="coin-change-row"><PercentageChange value={coin.price_change_percentage_24h} /><span className="period-label">Past 24 hours</span></div>
      <dl className="coin-meta">
        <div><dt>Market cap</dt><dd>{formatCompactUsd(coin.market_cap)}</dd></div>
        <div><dt>24h volume</dt><dd>{formatCompactUsd(coin.total_volume)}</dd></div>
      </dl>
    </article>
  )
}
