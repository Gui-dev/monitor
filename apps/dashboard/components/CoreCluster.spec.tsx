import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CoreCluster } from './CoreCluster'

describe('<CoreCluster />', () => {
  it('should render the title', () => {
    render(<CoreCluster cores={[50, 60]} />)
    expect(screen.getByText('CPU Core Cluster')).toBeInTheDocument()
  })

  it('should render core count', () => {
    render(<CoreCluster cores={[50, 60, 70]} />)
    expect(screen.getByText('3 Cores Active')).toBeInTheDocument()
  })

  it('should render each core with usage percent', () => {
    render(<CoreCluster cores={[45, 80]} />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('should render core labels', () => {
    render(<CoreCluster cores={[10, 20]} />)
    expect(screen.getByText('CORE 0')).toBeInTheDocument()
    expect(screen.getByText('CORE 1')).toBeInTheDocument()
  })

  it('should render default governor and architecture', () => {
    render(<CoreCluster cores={[50]} />)
    expect(screen.getByText('performance')).toBeInTheDocument()
    expect(screen.getByText('x86_64')).toBeInTheDocument()
  })

  it('should render custom governor and architecture', () => {
    render(<CoreCluster cores={[50]} governor="powersave" architecture="aarch64" />)
    expect(screen.getByText('powersave')).toBeInTheDocument()
    expect(screen.getByText('aarch64')).toBeInTheDocument()
  })
})
