import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWebSocket } from './useWebSocket'

const mockWs = {
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
  onopen: null as (() => void) | null,
  onmessage: null as ((event: { data: string }) => void) | null,
  onclose: null as (() => void) | null,
  onerror: null as (() => void) | null,
}

vi.stubGlobal(
  'WebSocket',
  vi.fn(() => mockWs),
)

describe('useWebSocket', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(WebSocket).mockReturnValue(mockWs as unknown as WebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should start with disconnected state', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))
    expect(result.current.connected).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('should connect and set connected to true', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))

    act(() => mockWs.onopen?.())

    expect(result.current.connected).toBe(true)
  })

  it('should update data on metric message', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))

    act(() => mockWs.onopen?.())
    act(() => {
      mockWs.onmessage?.({
        data: JSON.stringify({ type: 'metrics', hostname: 'test', cpu: { overall: 50 } }),
      })
    })

    expect(result.current.data?.hostname).toBe('test')
  })
})
