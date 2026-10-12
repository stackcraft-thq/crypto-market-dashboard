import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { testCoins } from '../../../test/fixtures/coins'
import { MarketDashboard } from './market-dashboard'

function renderDashboard() {
  const client = new QueryClient()
  return render(<QueryClientProvider client={client}><MarketDashboard /></QueryClientProvider>)
}

function response() { return new Response(JSON.stringify(testCoins)) }

describe('market dashboard', () => {
  it('does not start a request while already offline', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.stubGlobal('navigator', { onLine: false })
    renderDashboard()
    expect(screen.getByRole('heading', { name: 'You’re currently offline' })).toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })
  it('shows skeletons during the initial request', () => {
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))
    const { container } = renderDashboard()
    expect(screen.getByText('Loading market data…')).toBeInTheDocument()
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(8)
  })
  it('shows an error and recovers through retry', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('', { status: 403 })).mockResolvedValueOnce(response()))
    renderDashboard()
    expect(await screen.findByRole('heading', { name: 'The market is out of reach' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('heading', { name: 'Bitcoin' })).toBeInTheDocument()
  })
  it('searches locally, sorts, and clears empty results without refetching', async () => {
    const fetchMock = vi.fn().mockResolvedValue(response())
    vi.stubGlobal('fetch', fetchMock)
    renderDashboard()
    await screen.findByRole('heading', { name: 'Bitcoin' })
    await userEvent.click(screen.getByRole('combobox', { name: 'Sort coins' }))
    await userEvent.click(screen.getByRole('option', { name: 'Price: low to high' }))
    expect(screen.getAllByRole('article')[0]).toHaveAccessibleName('Tether market data')
    await userEvent.type(screen.getByRole('searchbox'), 'BTC')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    expect(screen.getByRole('article')).toHaveAccessibleName('Bitcoin market data')
    await userEvent.clear(screen.getByRole('searchbox'))
    await userEvent.type(screen.getByRole('searchbox'), 'unknown')
    expect(screen.getByRole('heading', { name: 'No coins found' })).toBeInTheDocument()
    await userEvent.click(screen.getAllByRole('button', { name: 'Clear search' }).at(-1)!)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
  it('preserves visible cards after a failed background refresh', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response()).mockResolvedValueOnce(new Response('', { status: 403 })))
    renderDashboard()
    await screen.findByRole('heading', { name: 'Bitcoin' })
    await userEvent.click(screen.getByRole('button', { name: 'Refresh prices' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Prices may be outdated'))
    expect(screen.getAllByRole('article')).toHaveLength(3)
    expect(screen.getByText('$65,000.00')).toBeInTheDocument()
  })
})
