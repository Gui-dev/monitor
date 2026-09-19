import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  color: 'success' | 'warning' | 'danger' | 'accent'
  pulse?: boolean
}

const colorMap = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  accent: 'bg-accent/15 text-accent border-accent/30',
}

export function StatusBadge({ label, color, pulse = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider',
        colorMap[color],
      )}
    >
      <span className={cn('w-2 h-2 rounded-full bg-current', pulse && 'animate-pulse')} />
      {label}
    </span>
  )
}
