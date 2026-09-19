import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('<StatusBadge />', () => {
  it('should render the label text', () => {
    render(<StatusBadge label="AGENT ONLINE" color="success" />)
    expect(screen.getByText('AGENT ONLINE')).toBeInTheDocument()
  })

  it('should apply pulse animation when pulse prop is true', () => {
    render(<StatusBadge label="STREAMING" color="accent" pulse />)
    const dot = screen.getByText('STREAMING').querySelector('.animate-pulse')
    expect(dot).toBeInTheDocument()
  })

  it('should not have pulse animation by default', () => {
    render(<StatusBadge label="IDLE" color="warning" />)
    const dot = screen.getByText('IDLE').querySelector('.animate-pulse')
    expect(dot).not.toBeInTheDocument()
  })
})
