import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MetricCard } from './metric-card'

describe('<MetricCard />', () => {
  it('should render title and value', () => {
    render(<MetricCard title="CPU" icon="🔥" value="42%" percent={42} />)
    expect(screen.getByText('CPU')).toBeInTheDocument()
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(<MetricCard title="RAM" icon="💾" value="8GB" percent={60} subtitle="DDR4" />)
    expect(screen.getByText('DDR4')).toBeInTheDocument()
  })

  it('should render details when provided', () => {
    render(
      <MetricCard
        title="Disk"
        icon="💿"
        value="500GB"
        percent={70}
        details={[
          { label: 'Read', value: '120MB/s' },
          { label: 'Write', value: '80MB/s' },
        ]}
      />,
    )
    expect(screen.getByText('Read:')).toBeInTheDocument()
    expect(screen.getByText('120MB/s')).toBeInTheDocument()
    expect(screen.getByText('Write:')).toBeInTheDocument()
    expect(screen.getByText('80MB/s')).toBeInTheDocument()
  })

  it('should not render details section when empty', () => {
    const { container } = render(<MetricCard title="CPU" icon="🔥" value="42%" percent={42} />)
    expect(container.querySelector('.flex.justify-between.mt-3')).not.toBeInTheDocument()
  })
})
