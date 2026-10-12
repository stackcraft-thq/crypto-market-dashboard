import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatChange } from '../../../shared/utils/format'

export function PercentageChange({ value }: { value: number | null }) {
  const direction = value === null || value === 0 ? 'neutral' : value > 0 ? 'positive' : 'negative'
  const Icon = direction === 'positive' ? ArrowUpRight : direction === 'negative' ? ArrowDownRight : Minus
  return <span className={`percentage-change ${direction}`}><Icon size={14} aria-hidden="true" />{formatChange(value)}</span>
}
