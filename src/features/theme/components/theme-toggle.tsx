import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../hooks/use-theme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
      {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  )
}
