import { useRef, useState } from 'react'
import type { ManualRefreshOptions } from '../types/manual-refresh'

export const MANUAL_REFRESH_COOLDOWN = 60_000

/** Keep manual refresh and all retry buttons behind the same burst guard. */
export function useManualRefresh({ now, online, busy, serverRetryAt, onRefresh }: ManualRefreshOptions) {
  const nextAttempt = useRef(0)
  const [manualRetryAt, setManualRetryAt] = useState(0)
  const retryAt = Math.max(manualRetryAt, serverRetryAt ?? 0)
  const cooldown = Math.max(0, Math.ceil((retryAt - now) / 1_000))
  const disabled = busy || !online || cooldown > 0

  function refresh() {
    const timestamp = Date.now()
    if (busy || !online || timestamp < Math.max(nextAttempt.current, serverRetryAt ?? 0)) return
    // A ref also guards clicks arriving before React has rendered the disabled button.
    nextAttempt.current = timestamp + MANUAL_REFRESH_COOLDOWN
    setManualRetryAt(nextAttempt.current)
    onRefresh()
  }

  return { refresh, cooldown, disabled }
}
