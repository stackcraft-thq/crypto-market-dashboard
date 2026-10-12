export interface ManualRefreshOptions {
  now: number
  online: boolean
  busy: boolean
  serverRetryAt: number | null
  onRefresh: () => void
}
