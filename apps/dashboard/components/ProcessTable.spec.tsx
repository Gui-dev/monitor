import type { ProcessInfo } from '@pulseos/shared'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProcessTable } from './ProcessTable'

const mockProcesses: ProcessInfo[] = [
  { pid: 1420, name: 'node /agent/server.js', user: 'root', cpu: 18.4, mem: 4.2 },
  { pid: 2189, name: 'next-server (v14.2)', user: 'www-data', cpu: 12.1, mem: 14.8 },
]

describe('<ProcessTable />', () => {
  it('should render process list', () => {
    render(<ProcessTable processes={mockProcesses} onKill={vi.fn()} />)
    expect(screen.getByText('node /agent/server.js')).toBeInTheDocument()
    expect(screen.getByText('next-server (v14.2)')).toBeInTheDocument()
  })

  it('should display PID and user for each process', () => {
    render(<ProcessTable processes={mockProcesses} onKill={vi.fn()} />)
    expect(screen.getByText('1420')).toBeInTheDocument()
    expect(screen.getByText('root')).toBeInTheDocument()
  })

  it('should call onKill with pid on double click confirm', async () => {
    const user = userEvent.setup()
    const onKill = vi.fn()
    render(<ProcessTable processes={mockProcesses} onKill={onKill} />)

    const killButton = screen.getAllByText('✕')[0]
    await user.click(killButton)
    expect(screen.getByText('Confirm?')).toBeInTheDocument()

    await user.click(screen.getByText('Confirm?'))
    expect(onKill).toHaveBeenCalledWith(1420)
  })
})
