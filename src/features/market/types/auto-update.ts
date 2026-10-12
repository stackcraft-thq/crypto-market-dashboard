import type { UpdateInterval } from './update-interval'

export interface AutoUpdateToggleProps {
  enabled: boolean
  online: boolean
  cooldown: number
  hasError: boolean
  interval: UpdateInterval
  onToggle: () => void
}
