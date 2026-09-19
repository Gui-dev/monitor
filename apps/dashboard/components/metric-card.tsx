import { GradientGauge } from './gradient-gauge'

interface MetricCardProps {
  title: string
  icon: string
  value: string | number
  subtitle?: string
  percent: number
  details?: { label: string; value: string | number }[]
}

export function MetricCard({
  title,
  icon,
  value,
  subtitle,
  percent,
  details = [],
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="text-sm font-medium text-text-primary">{title}</h3>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>
        </div>
        <span className="text-2xl font-bold text-accent font-mono">{value}</span>
      </div>
      <GradientGauge value={percent} height="h-1.5" />
      {details.length > 0 && (
        <div className="flex justify-between mt-3">
          {details.map((d) => (
            <span key={d.label} className="text-xs text-text-muted">
              {d.label}: <span className="text-text-primary font-mono">{d.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
