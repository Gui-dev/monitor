'use client'
import type { ProcessInfo } from '@pulseos/shared'
import { useState } from 'react'

interface ProcessTableProps {
  processes: ProcessInfo[]
  onKill: (pid: number) => void
}

export function ProcessTable({ processes, onKill }: ProcessTableProps) {
  const [confirmKill, setConfirmKill] = useState<number | null>(null)

  const handleKill = (pid: number) => {
    if (confirmKill === pid) {
      onKill(pid)
      setConfirmKill(null)
    } else {
      setConfirmKill(pid)
      setTimeout(() => setConfirmKill(null), 3000)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <h3 className="text-sm font-medium text-text-primary">Active Process Tree</h3>
          <span className="text-xs text-text-muted">
            Top resource consumers updated via Node agent
          </span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">PID</th>
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">PROCESS</th>
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">USER</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">CPU %</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">MEM %</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => (
              <tr
                key={proc.pid}
                className="border-b border-border/50 hover:bg-background/50 transition-colors"
              >
                <td className="py-2 px-3 font-mono text-text-primary">{proc.pid}</td>
                <td className="py-2 px-3 font-mono text-text-primary">{proc.name}</td>
                <td className="py-2 px-3 text-text-muted">{proc.user}</td>
                <td className="py-2 px-3 text-right font-mono text-text-primary">
                  {proc.cpu.toFixed(1)}%
                </td>
                <td className="py-2 px-3 text-right font-mono text-text-primary">
                  {proc.mem.toFixed(1)}%
                </td>
                <td className="py-2 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleKill(proc.pid)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      confirmKill === proc.pid
                        ? 'bg-danger/20 text-danger border border-danger/40'
                        : 'bg-background text-text-muted hover:text-danger hover:bg-danger/10 border border-border'
                    }`}
                  >
                    {confirmKill === proc.pid ? 'Confirm?' : '✕'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
