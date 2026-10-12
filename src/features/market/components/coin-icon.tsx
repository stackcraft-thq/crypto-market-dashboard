import { useState } from 'react'

export function CoinIcon({ src, symbol }: { src: string; symbol: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <span className="coin-icon" aria-hidden="true">
      {src && !failed
        ? <img src={src} alt="" width="40" height="40" loading="lazy" onError={() => setFailed(true)} />
        : <span className="coin-icon-fallback">{symbol.slice(0, 2).toUpperCase()}</span>}
    </span>
  )
}
