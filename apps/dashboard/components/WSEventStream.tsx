'use client'
import { useEffect, useRef, useState } from 'react'

interface WSEvent {
  timestamp: string
  direction: 'rx' | 'tx'
  data: string
}

interface WSEventStreamProps {
  events: WSEvent[]
  onSend: (command: string) => void
}

export function WSEventStream({ events, onSend }: WSEventStreamProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new events
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [events])

  const handleSend = () => {
    if (input.trim()) {
      onSend(input.trim())
      setInput('')
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-medium text-text-primary">WebSocket Event Stream</h3>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto bg-background rounded-lg p-3 font-mono text-xs space-y-1"
      >
        {events.map((event, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: WS events are append-only
          <div key={i} className="flex gap-2">
            <span className="text-text-muted">[{event.timestamp}]</span>
            <span className={event.direction === 'rx' ? 'text-success' : 'text-accent'}>
              [WS FRAME] {event.direction}:
            </span>
            <span className="text-text-muted truncate">{event.data}</span>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-text-muted">Waiting for WebSocket frames...</div>
        )}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send debug command (e.g., --ping)..."
          className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted font-mono focus:outline-none focus:border-accent/50"
        />
        <button
          type="button"
          onClick={handleSend}
          className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
