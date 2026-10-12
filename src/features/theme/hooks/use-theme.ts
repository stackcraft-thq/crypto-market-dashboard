import { useSyncExternalStore } from 'react'
import type { Theme } from '../types/theme'

const STORAGE_KEY = 'coinscope-theme'
const EVENT = 'coinscope-theme-change'
let memoryPreference: Theme | null = null

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : memoryPreference
  } catch { return memoryPreference }
}

function getTheme(): Theme {
  return storedTheme() ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

function subscribe(listener: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const update = () => {
    document.documentElement.dataset.theme = getTheme()
    listener()
  }
  window.addEventListener(EVENT, update)
  window.addEventListener('storage', update)
  media.addEventListener('change', update)
  return () => {
    window.removeEventListener(EVENT, update)
    window.removeEventListener('storage', update)
    media.removeEventListener('change', update)
  }
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light')
  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    memoryPreference = next
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* Keep the in-memory preference if storage is blocked. */ }
    document.documentElement.dataset.theme = next
    window.dispatchEvent(new Event(EVENT))
  }
  return { theme, toggleTheme }
}
