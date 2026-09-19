import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { WSEventStream } from './ws-event-stream'

const mockEvents = [
  { timestamp: '12:00:01', direction: 'rx' as const, data: '{"type":"metrics"}' },
  { timestamp: '12:00:02', direction: 'tx' as const, data: '--ping' },
]

describe('<WSEventStream />', () => {
  it('should render the title', () => {
    render(<WSEventStream events={[]} onSend={vi.fn()} />)
    expect(screen.getByText('WebSocket Event Stream')).toBeInTheDocument()
  })

  it('should render events', () => {
    render(<WSEventStream events={mockEvents} onSend={vi.fn()} />)
    expect(screen.getByText('[WS FRAME] rx:')).toBeInTheDocument()
    expect(screen.getByText('[WS FRAME] tx:')).toBeInTheDocument()
    expect(screen.getByText('{"type":"metrics"}')).toBeInTheDocument()
    expect(screen.getByText('--ping')).toBeInTheDocument()
  })

  it('should show waiting message when empty', () => {
    render(<WSEventStream events={[]} onSend={vi.fn()} />)
    expect(screen.getByText('Waiting for WebSocket frames...')).toBeInTheDocument()
  })

  it('should call onSend when clicking Send button', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<WSEventStream events={[]} onSend={onSend} />)

    await user.type(screen.getByPlaceholderText(/Send debug command/), '--status')
    await user.click(screen.getByRole('button', { name: /Send/i }))
    expect(onSend).toHaveBeenCalledWith('--status')
  })

  it('should call onSend on Enter key', async () => {
    const user = userEvent.setup()
    const onSend = vi.fn()
    render(<WSEventStream events={[]} onSend={onSend} />)

    const input = screen.getByPlaceholderText(/Send debug command/)
    await user.type(input, '--ping{Enter}')
    expect(onSend).toHaveBeenCalledWith('--ping')
  })
})
