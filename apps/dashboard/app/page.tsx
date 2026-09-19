'use client'
import { useMemo } from 'react'
import { CoreCluster } from '@/components/CoreCluster'
import { Header } from '@/components/Header'
import { MetricCard } from '@/components/MetricCard'
import { ProcessTable } from '@/components/ProcessTable'
import { RealTimeChart } from '@/components/RealTimeChart'
import { ServerInfoCard } from '@/components/ServerInfoCard'
import { WSEventStream } from '@/components/WSEventStream'
import { useWebSocket } from '@/hooks/useWebSocket'

const WS_URL = 'ws://localhost:3001/ws'

export default function Dashboard() {
  const { data, connected, wsRate, events, send } = useWebSocket(WS_URL)

  const chartData = useMemo(
    () => Array.from({ length: 200 }, (_, i) => ({ time: `${200 - i}`, cpu: 0, ram: 0 })),
    [],
  )

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
