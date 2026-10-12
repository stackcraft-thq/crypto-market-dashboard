import type { ReactNode } from 'react'

export interface DropdownOption<T extends string | number> {
  value: T
  label: string
}

export interface DropdownProps<T extends string | number> {
  label: string
  value: T
  options: readonly DropdownOption<T>[]
  onChange: (value: T) => void
  icon?: ReactNode
  className?: string
}
