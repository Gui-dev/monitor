import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('<Header />', () => {
  it('should render the agent name', () => {
    render(<Header wsConnected={false} />)
    expect(
      screen.getByText((_, element) => element?.textContent === 'PulseOS.node'),
    ).toBeInTheDocument()
  })

  it('should show active WS status when connected', () => {
    render(<Header wsConnected={true} />)
    expect(screen.getByText('WS Stream: Active')).toBeInTheDocument()
  })

  it('should show disconnected WS status when not connected', () => {
    render(<Header wsConnected={false} />)
    expect(screen.getByText('WS Stream: Disconnected')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(<Header wsConnected={false} />)
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /UI Component Library/i })).toBeInTheDocument()
  })
})
