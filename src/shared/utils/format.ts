export function formatPrice(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Unavailable'
  if (value !== 0 && Math.abs(value) < 0.000001) return `$${value.toExponential(2)}`
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.abs(value) >= 1 || value === 0 ? 2 : Math.min(10, Math.ceil(-Math.log10(Math.abs(value))) + 2),
  }).format(value)
}

export function formatCompactUsd(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Unavailable'
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 2,
  }).format(value)
}

export function formatChange(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return 'Unavailable'
  if (value !== 0 && Math.abs(value) < 0.01) return value > 0 ? '+<0.01%' : '−<0.01%'
  return `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(2)}%`
}

export function formatUpdateTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' }).format(timestamp)
}
