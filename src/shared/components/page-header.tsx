import { ThemeToggle } from '../../features/theme/components/theme-toggle'
import { Brand } from './brand'

export function PageHeader() {
  return (
    <header className="page-header">
      <div className="container header-inner">
        <Brand />
        <div className="header-section"><span className="nav-label">Market overview</span><span className="header-divider" /><ThemeToggle /></div>
      </div>
    </header>
  )
}
