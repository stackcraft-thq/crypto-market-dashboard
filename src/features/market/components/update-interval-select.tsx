import { Clock } from 'lucide-react'
import { Dropdown } from '../../../shared/components/dropdown'
import { UPDATE_INTERVAL_OPTIONS } from '../types/update-interval'
import type { UpdateIntervalSelectProps } from '../types/update-interval'

export function UpdateIntervalSelect({ value, onChange }: UpdateIntervalSelectProps) {
  return (
    <Dropdown label="Update interval" value={value} options={UPDATE_INTERVAL_OPTIONS} onChange={onChange} icon={<Clock size={15} />} className="update-interval-field" />
  )
}
