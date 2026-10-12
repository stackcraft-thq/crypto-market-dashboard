export interface MarketStateProps {
  kind: 'error' | 'empty' | 'offline' | 'no-data'
  message?: string
  onAction: () => void
  disabled?: boolean
  cooldown?: number
}
