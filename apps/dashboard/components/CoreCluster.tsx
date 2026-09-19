import { GradientGauge } from './GradientGauge'

interface CoreClusterProps {
  cores: number[]
  governor?: string
  architecture?: string
}

export function CoreCluster({
  cores,
  governor = 'performance',
  architecture = 'x86_64',
}: CoreClusterProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <h3 className="text-sm font-medium text-text-primary">CPU Core Cluster</h3>
        </div>
        <span className="text-xs text-text-muted">{cores.length} Cores Active</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cores.map((usage, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: CPU cores are static, index is stable
          <div key={i} className="bg-background rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-text-muted">CORE {i}</span>
              <span className="text-xs font-mono text-accent">{usage}%</span>
            </div>
            <GradientGauge value={usage} height="h-1.5" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-text-muted">
          Gov: <span className="text-text-primary font-mono">{governor}</span>
        </span>
        <span className="text-xs text-text-muted">
          Architecture: <span className="text-text-primary font-mono">{architecture}</span>
        </span>
      </div>
    </div>
  )
}
