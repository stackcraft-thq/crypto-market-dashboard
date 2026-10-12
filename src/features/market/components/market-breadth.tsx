import type { MarketBreadthProps } from '../types/market-breadth'

export function MarketBreadth({ rising, falling, unchanged, unavailable }: MarketBreadthProps) {
  const total = rising + falling + unchanged + unavailable
  if (total === 0) return <span className="overview-caption">Waiting for market data</span>

  return (
    <div className="market-breadth">
      <div className="breadth-bar" role="img" aria-label={`${rising} rising, ${falling} falling, ${unchanged} unchanged, ${unavailable} unavailable among fetched coins`}>
        {rising > 0 && <span className="breadth-rising" style={{ flex: rising }} />}
        {falling > 0 && <span className="breadth-falling" style={{ flex: falling }} />}
        {unchanged > 0 && <span className="breadth-unchanged" style={{ flex: unchanged }} />}
        {unavailable > 0 && <span className="breadth-unavailable" style={{ flex: unavailable }} />}
      </div>
      <div className="breadth-legend"><span><i className="breadth-rising" aria-hidden="true" />{rising} rising</span><span><i className="breadth-falling" aria-hidden="true" />{falling} falling</span></div>
      {(unchanged > 0 || unavailable > 0) && <span className="breadth-other">{[unchanged > 0 ? `${unchanged} unchanged` : '', unavailable > 0 ? `${unavailable} unavailable` : ''].filter(Boolean).join(' · ')}</span>}
    </div>
  )
}
