import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useManualRefresh } from './use-manual-refresh'

describe('manual refresh guard', () => {
  it('blocks burst clicks, then allows a request after a minute', () => {
    const now = Date.now()
    const onRefresh = vi.fn()
    vi.spyOn(Date, 'now').mockReturnValue(now)
    const { result, rerender } = renderHook(({ timestamp }) => useManualRefresh({ now: timestamp, online: true, busy: false, serverRetryAt: null, onRefresh }), { initialProps: { timestamp: now } })
    act(() => { for (let click = 0; click < 10; click++) result.current.refresh() })
    expect(onRefresh).toHaveBeenCalledTimes(1)
    expect(result.current.cooldown).toBe(60)
    expect(result.current.disabled).toBe(true)
    vi.spyOn(Date, 'now').mockReturnValue(now + 61_000)
    rerender({ timestamp: now + 61_000 })
    act(() => result.current.refresh())
    expect(onRefresh).toHaveBeenCalledTimes(2)
  })
  it('respects server cooldowns, offline state, and active requests', () => {
    const now = Date.now()
    const onRefresh = vi.fn()
    const { result, rerender } = renderHook(({ online, busy, serverRetryAt }) => useManualRefresh({ now, online, busy, serverRetryAt, onRefresh }), { initialProps: { online: true, busy: false, serverRetryAt: now + 180_000 } })
    act(() => result.current.refresh())
    expect(result.current.cooldown).toBe(180)
    rerender({ online: false, busy: false, serverRetryAt: 0 })
    act(() => result.current.refresh())
    rerender({ online: true, busy: true, serverRetryAt: 0 })
    act(() => result.current.refresh())
    expect(onRefresh).not.toHaveBeenCalled()
  })
})
