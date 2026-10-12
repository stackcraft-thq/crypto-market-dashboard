import { MarketDashboard } from './features/market/components/market-dashboard'
import { PageHeader } from './shared/components/page-header'
import { PageFooter } from './shared/components/page-footer'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to market</a>
      <PageHeader />
      <MarketDashboard />
      <PageFooter />
    </>
  )
}
