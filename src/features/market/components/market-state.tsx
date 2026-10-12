import { AlertCircle, RefreshCw, SearchX, WifiOff } from 'lucide-react'
import type { MarketStateProps } from '../types/market-state'

export function MarketState({ kind, message, onAction, disabled = false, cooldown = 0 }: MarketStateProps) {
  const Icon = kind === 'error' ? AlertCircle : kind === 'offline' ? WifiOff : SearchX
  const title = kind === 'error' ? 'The market is out of reach'
    : kind === 'offline' ? 'You’re currently offline'
    : kind === 'empty' ? 'No coins found' : 'No market data available'
  const description = message ?? (kind === 'empty' ? 'Try a different coin name or symbol, or clear your search.'
    : kind === 'offline' ? 'We’ll reconnect automatically when your internet connection returns.'
    : 'CoinGecko returned an empty list. Try refreshing in a moment.')
  return (
    <div className="market-state" role={kind === 'error' ? 'alert' : 'status'}>
      <span className="state-icon"><Icon size={27} aria-hidden="true" /></span>
      <h3>{title}</h3><p>{description}</p>
      {kind !== 'offline' && <button className="button button-primary" onClick={onAction} disabled={disabled}>
        {kind !== 'empty' && <RefreshCw size={16} aria-hidden="true" />}
        {kind === 'empty' ? 'Clear search' : cooldown > 0 ? `Try again in ${cooldown}s` : disabled ? 'Trying again…' : 'Try again'}
      </button>}
    </div>
  )
}
