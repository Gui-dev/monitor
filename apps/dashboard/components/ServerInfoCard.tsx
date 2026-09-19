import type { MetricPayload } from '@pulseos/shared'

interface ServerInfoCardProps {
  data: MetricPayload | null
  wsRate: number
}

export function ServerInfoCard({ data, wsRate }: ServerInfoCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <span className="text-accent font-mono">&gt;_</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text-primary font-mono">
              {data?.hostname || '---'}
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/15 text-success border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
            </span>
          </div>
          <p className="text-xs text-text-muted">{data?.kernel || '---'}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Uptime</p>
          <p className="text-sm font-mono text-text-primary">{data?.uptime || '---'}</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Node Agent</p>
          <p className="text-sm font-mono text-accent">~24 ms (Tick)</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">WebSocket Rate</p>
          <p className="text-sm font-mono text-text-primary">{wsRate} msgs/sec</p>
        </div>
        <div className="bg-background rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Load Average</p>
          <p className="text-sm font-mono text-text-primary">
            {data?.loadAvg
              ? `${data.loadAvg[0].toFixed(2)}, ${data.loadAvg[1].toFixed(2)}, ${data.loadAvg[2].toFixed(2)}`
              : '---'}
          </p>
        </div>
      </div>
    </div>
  )
}
