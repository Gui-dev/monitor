import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RealTimeChart } from './RealTimeChart'

describe('<RealTimeChart />', () => {
  const sampleData = [
    { time: '1', cpu: 45, ram: 60 },
    { time: '2', cpu: 50, ram: 55 },
    { time: '3', cpu: 35, ram: 65 },
  ]

  it('should render the chart title', () => {
    render(<RealTimeChart data={sampleData} />)
    expect(screen.getByText('Real-time System Load Stream')).toBeInTheDocument()
  })

  it('should render legend labels', () => {
    render(<RealTimeChart data={sampleData} />)
    expect(screen.getByText('CPU %')).toBeInTheDocument()
    expect(screen.getByText('RAM %')).toBeInTheDocument()
  })

  it('should render with empty data', () => {
    render(<RealTimeChart data={[]} />)
    expect(screen.getByText('Real-time System Load Stream')).toBeInTheDocument()
  })

  it('should render the chart wrapper div', () => {
    const { container } = render(<RealTimeChart data={sampleData} />)
    const chartDiv = container.querySelector('.h-64')
    expect(chartDiv).toBeInTheDocument()
  })
})
