import { StatusBadge } from './StatusBadge'

interface HeaderProps {
  wsConnected: boolean
}

export function Header({ wsConnected }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-mono font-bold text-sm">&gt;_</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">
              Pulse<span className="text-accent">OS</span>.node
            </h1>
            <p className="text-xs text-text-muted">
              Linux Monitoring Agent &amp; WebSocket Telemetry Stream
            </p>
          </div>
        </div>
        <StatusBadge label="V2.4.0" color="accent" />
      </div>
      <nav className="flex items-center gap-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-accent/15 text-accent text-sm font-medium border border-accent/30 hover:bg-accent/25 transition-colors"
        >
          Dashboard
        </button>
        <button
          type="button"
          className="px-4 py-2 rounded-lg text-text-muted text-sm font-medium hover:bg-card transition-colors"
        >
          UI Component Library
        </button>
      </nav>
      <StatusBadge
        label={wsConnected ? 'WS Stream: Active' : 'WS Stream: Disconnected'}
        color={wsConnected ? 'success' : 'danger'}
        pulse={wsConnected}
      />
    </header>
  )
}
