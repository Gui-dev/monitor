import { cn } from '@/lib/utils'

interface GradientGaugeProps {
  value: number
  max?: number
  height?: string
}

export function GradientGauge({ value, max = 100, height = 'h-2' }: GradientGaugeProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className={cn('w-full rounded-full bg-border overflow-hidden', height)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percent}%`,
          background: 'linear-gradient(90deg, #f0b429 0%, #d9a020 100%)',
        }}
      />
    </div>
  )
}
