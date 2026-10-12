import { queryOptions, useQuery } from '@tanstack/react-query'
import { ApiError } from '../api/api-error'
import { fetchCoins } from '../api/coins'
import { useOnline } from '../../../shared/hooks/use-online'
import { autoUpdateInterval } from '../utils/auto-update'
import type { UpdateInterval } from '../types/update-interval'

export const marketQueryOptions = queryOptions({
  queryKey: ['coins', 'markets', 'usd', 'top-20'],
  queryFn: ({ signal }) => fetchCoins(signal),
  staleTime: 2 * 60_000,
  gcTime: 15 * 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: true,
  retry: (failureCount, error) =>
    failureCount < 2 && error instanceof ApiError && (error.status === 0 || error.status >= 500),
  retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 8_000),
})

export function useMarket(autoUpdate = false, interval: UpdateInterval = 60_000) {
  const online = useOnline()
  return useQuery({
    ...marketQueryOptions,
    enabled: online,
    refetchInterval: (query) => autoUpdateInterval(autoUpdate, query.state.error, Date.now(), interval),
    refetchIntervalInBackground: false,
  })
}
