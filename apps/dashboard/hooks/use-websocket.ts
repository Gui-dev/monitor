'use client'
import type { MetricPayload } from '@pulseos/shared'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseWebSocketReturn {
  data: MetricPayload | null
  connected: boolean
  wsRate: number
  events: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
  send: (command: string) => void
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [data, setData] = useState<MetricPayload | null>(null)
  const [connected, setConnected] = useState(false)
  const [wsRate, setWsRate] = useState(0)
  const [events, setEvents] = useState<
    { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
  >([])
  const wsRef = useRef<WebSocket | null>(null)
  const messageCount = useRef(0)
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getTimestamp = useCallback(() => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  }, [])

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      ws.onopen = () => setConnected(true)
      ws.onmessage = (event) => {
        setEvents((prev) => [
          ...prev.slice(-99),
          { timestamp: getTimestamp(), direction: 'rx', data: event.data.substring(0, 120) },
        ])
        try {
          const parsed = JSON.parse(event.data)
          if (parsed.type === 'metrics') setData(parsed as MetricPayload)
          messageCount.current++
        } catch {
          /* non-JSON */
        }
      }
      ws.onclose = () => {
        setConnected(false)
        reconnectTimeout.current = setTimeout(connect, 3000)
      }
      ws.onerror = () => ws.close()
      wsRef.current = ws
    } catch {
      reconnectTimeout.current = setTimeout(connect, 3000)
    }
  }, [url, getTimestamp])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current)
    }
  }, [connect])

  useEffect(() => {
    const interval = setInterval(() => {
      setWsRate(messageCount.current)
      messageCount.current = 0
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const send = useCallback(
    (command: string) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(command)
        setEvents((prev) => [
          ...prev.slice(-99),
          { timestamp: getTimestamp(), direction: 'tx', data: command },
        ])
      }
    },
    [getTimestamp],
  )

  return { data, connected, wsRate, events, send }
}
