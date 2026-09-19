'use client'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface ChartDataPoint {
  time: string
  cpu: number
  ram: number
}

interface RealTimeChartProps {
  data: ChartDataPoint[]
}

export function RealTimeChart({ data }: RealTimeChartProps) {
  const formattedData = useMemo(
    () =>
      data.map((point, i) => ({
        ...point,
        label: `${Math.round((data.length - i) * 0.1)}s ago`,
      })),
    [data],
  )

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-medium text-text-primary">Real-time System Load Stream</h3>
          <span className="text-xs text-text-muted">
            Live WebSocket telemetry buffer (100ms sample rate)
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-text-muted">CPU %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-xs text-text-muted">RAM %</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0b429" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f0b429" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={{ stroke: '#1e1e2e' }}
              axisLine={{ stroke: '#1e1e2e' }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 10 }}
              tickLine={{ stroke: '#1e1e2e' }}
              axisLine={{ stroke: '#1e1e2e' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#12121a',
                border: '1px solid #1e1e2e',
                borderRadius: '8px',
                color: '#e0e0e0',
              }}
            />
            <Area
              type="monotone"
              dataKey="cpu"
              stroke="#f0b429"
              strokeWidth={2}
              fill="url(#cpuGradient)"
              dot={false}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="ram"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#ramGradient)"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
