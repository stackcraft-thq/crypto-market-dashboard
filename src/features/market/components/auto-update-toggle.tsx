import type { AutoUpdateToggleProps } from '../types/auto-update'

export function AutoUpdateToggle({ enabled, online, cooldown, hasError, interval, onToggle }: AutoUpdateToggleProps) {
  const status = !enabled ? 'Manual refresh'
    : !online ? 'Paused · offline'
    : cooldown > 0 ? 'Paused · rate limit'
    : hasError ? 'Paused · retry to resume'
    : interval === 60_000 ? 'Every 60 seconds' : `Every ${interval / 60_000} minutes`

  return (
    <div className="auto-update-control">
      <div className="auto-update-label"><span id="auto-update-label">Auto-update</span><span id="auto-update-description">{status}</span></div>
      <button type="button" role="switch" aria-checked={enabled} aria-labelledby="auto-update-label" aria-describedby="auto-update-description" className="auto-update-switch" onClick={onToggle}>
        <span className="auto-update-track"><span /></span>
      </button>
    </div>
  )
}
