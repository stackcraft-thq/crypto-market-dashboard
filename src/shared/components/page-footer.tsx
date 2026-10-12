import { ArrowUpRight } from 'lucide-react'

export function PageFooter() {
  return (
    <footer className="container page-footer">
      <span>A clearer view of crypto.</span>
      <a href="https://www.coingecko.com/" target="_blank" rel="noreferrer">Data by CoinGecko <ArrowUpRight size={14} aria-hidden="true" /></a>
      <span className="footer-note">Prices in USD · For informational purposes</span>
    </footer>
  )
}
