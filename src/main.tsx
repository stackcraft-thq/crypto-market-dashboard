import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/manrope'
import './styles/base.css'
import './styles/layout.css'
import './styles/dropdown.css'
import './features/market/styles/market.css'
import './features/market/styles/market-breadth.css'
import './features/market/styles/auto-update.css'
import './features/market/styles/update-interval.css'

const queryClient = new QueryClient()
const root = document.getElementById('root')
if (!root) throw new Error('Application root was not found')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}><App /></QueryClientProvider>
  </StrictMode>,
)
