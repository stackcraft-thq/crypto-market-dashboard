import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { DropdownProps } from '../types/dropdown'

export function Dropdown<T extends string | number>({ label, value, options, onChange, icon, className = '' }: DropdownProps<T>) {
  return (
    <div className={`dropdown ${className}`}>
      <Select.Root value={String(value)} onValueChange={(next) => {
        const option = options.find((item) => String(item.value) === next)
        if (option) onChange(option.value)
      }}>
        <Select.Trigger className="dropdown-trigger" aria-label={label}>
          {icon && <span className="dropdown-leading-icon" aria-hidden="true">{icon}</span>}
          <Select.Value />
          <Select.Icon className="dropdown-chevron"><ChevronDown size={14} aria-hidden="true" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="dropdown-menu" position="popper" align="end" sideOffset={7} collisionPadding={12} aria-label={label}>
            <Select.ScrollUpButton className="dropdown-scroll"><ChevronUp size={14} aria-hidden="true" /></Select.ScrollUpButton>
            <Select.Viewport className="dropdown-options">
              {options.map((option) => (
                <Select.Item className="dropdown-option" key={option.value} value={String(option.value)}>
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="dropdown-check"><Check size={15} aria-hidden="true" /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="dropdown-scroll"><ChevronDown size={14} aria-hidden="true" /></Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
