export type UpdateInterval = 60_000 | 120_000 | 300_000

export const UPDATE_INTERVAL_OPTIONS: { value: UpdateInterval; label: string }[] = [
  { value: 60_000, label: 'Every 1 minute' },
  { value: 120_000, label: 'Every 2 minutes' },
  { value: 300_000, label: 'Every 5 minutes' },
]

export function isUpdateInterval(value: number): value is UpdateInterval {
  return UPDATE_INTERVAL_OPTIONS.some((option) => option.value === value)
}

export interface UpdateIntervalSelectProps {
  value: UpdateInterval
  onChange: (value: UpdateInterval) => void
}
