'use client'
import type { MetricPayload } from '@pulseos/shared'
import { useEffect, useRef, useState } from 'react'
import { CoreCluster } from '@/components/CoreCluster'
import { Header } from '@/components/Header'
import { MetricCard } from '@/components/MetricCard'
import { ProcessTable } from '@/components/ProcessTable'
import { RealTimeChart } from '@/components/RealTimeChart'
import { ServerInfoCard } from '@/components/ServerInfoCard'
import { WSEventStream } from '@/components/WSEventStream'
import { useWebSocket } from '@/hooks/useWebSocket'

const WS_URL = 'ws://localhost:3001/ws'
const API_URL = 'http://localhost:3001'
const MAX_CHART_POINTS = 200

interface ChartPoint {
  time: string
  cpu: number
  ram: number
}

export default function Dashboard() {
  const { data: wsData, connected, wsRate, events, send } = useWebSocket(WS_URL)
  const [data, setData] = useState<MetricPayload | null>(null)
  const [chartData, setChartData] = useState<ChartPoint[]>(() =>
    Array.from({ length: MAX_CHART_POINTS }, (_, i) => ({
      time: `${MAX_CHART_POINTS - i}`,
      cpu: 0,
      ram: 0,
    })),
  )
  const pointIndex = useRef(MAX_CHART_POINTS)

  // Fetch initial data via REST
  useEffect(() => {
    fetch(`${API_URL}/api/metrics/current`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.type === 'metrics') {
          setData(payload as MetricPayload)
        }
      })
      .catch(() => {})
  }, [])

  // Update data from WebSocket
  useEffect(() => {
    if (wsData) {
      setData(wsData)
      pointIndex.current++
      setChartData((prev) => [
        ...prev.slice(1),
        {
          time: `${pointIndex.current}`,
          cpu: wsData.cpu.overall,
          ram: wsData.ram.percent,
        },
      ])
    }
  }, [wsData])

  return (
    <div className="min-h-screen bg-background">
      <Header wsConnected={connected} />
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <ServerInfoCard data={data} wsRate={wsRate} />
        <div className="grid grid-cols-2 gap-6">
          <MetricCard
            title="CPU Load"
            icon="🔲"
            value={`${data?.cpu.overall || 0}%`}
            subtitle={`${data?.cpu.cores.length || 0} Cores @ ${data?.cpu.speed || 0}GHz`}
            percent={data?.cpu.overall || 0}
            details={[
              { label: 'Core Temp', value: data?.cpu.temp ? `${data.cpu.temp}°C` : 'N/A' },
              { label: 'Processes', value: data?.processes.length || 0 },
            ]}
          />
          <MetricCard
            title="RAM Usage"
            icon="🔲"
            value={`${data?.ram.percent || 0}%`}
            subtitle={`${((data?.ram.total || 0) / 1024 ** 3).toFixed(0)} GB`}
            percent={data?.ram.percent || 0}
            details={[
              { label: 'Used', value: `${((data?.ram.used || 0) / 1024 ** 3).toFixed(1)} GB` },
              { label: 'Cache', value: `${((data?.ram.cached || 0) / 1024 ** 3).toFixed(1)} GB` },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <MetricCard
            title="Disk Storage"
            icon="🔲"
            value={`${data?.disk.percent || 0}%`}
            subtitle={`${data?.disk.device || '/'} ${data?.disk.mountpoint || '/'}`}
            percent={data?.disk.percent || 0}
            details={[
              {
                label: 'I/O Read',
                value: `${((data?.disk.readSpeed || 0) / 1024 ** 2).toFixed(1)} MB/s`,
              },
              {
                label: 'Write',
                value: `${((data?.disk.writeSpeed || 0) / 1024 ** 2).toFixed(1)} MB/s`,
              },
            ]}
          />
          <MetricCard
            title="Network Interface"
            icon="🔲"
            value={`${((data?.network.rx || 0) / 1024 ** 2).toFixed(1)} Gbps`}
            subtitle={data?.network.interface || 'eth0'}
            percent={Math.min(((data?.network.rx || 0) / 1024 ** 3) * 100, 100)}
            details={[
              { label: 'RX', value: `${((data?.network.rx || 0) / 1024 ** 2).toFixed(0)} MB/s` },
              { label: 'TX', value: `${((data?.network.tx || 0) / 1024 ** 2).toFixed(0)} MB/s` },
            ]}
          />
        </div>
        <RealTimeChart data={chartData} />
        <CoreCluster cores={data?.cpu.cores || []} />
        <ProcessTable processes={data?.processes || []} onKill={(pid) => send(`kill:${pid}`)} />
        <WSEventStream events={events} onSend={send} />
      </main>
    </div>
  )
}
