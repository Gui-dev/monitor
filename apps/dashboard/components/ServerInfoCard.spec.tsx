import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ServerInfoCard } from './ServerInfoCard'

describe('<ServerInfoCard />', () => {
  it('should render hostname from data', () => {
    render(
      <ServerInfoCard
        data={{
          type: 'metrics',
          timestamp: Date.now(),
          hostname: 'prod-server-01',
          kernel: '6.1.0-linux',
          uptime: '14d 3h',
          cpu: { overall: 45, cores: [40, 50], temp: 65, model: 'Intel', speed: 3.2 },
          ram: { total: 16000, used: 8000, free: 8000, cached: 2000, percent: 50 },
          disk: {
            total: 500,
            used: 350,
            percent: 70,
            readSpeed: 100,
            writeSpeed: 80,
            device: 'sda',
            mountpoint: '/',
          },
          network: { rx: 1000, tx: 500, interface: 'eth0' },
          processes: [],
          loadAvg: [1.5, 1.2, 1.0],
        }}
        wsRate={12}
      />,
    )
    expect(screen.getByText('prod-server-01')).toBeInTheDocument()
    expect(screen.getByText('6.1.0-linux')).toBeInTheDocument()
  })

  it('should render placeholders when data is null', () => {
    render(<ServerInfoCard data={null} wsRate={0} />)
    const dashes = screen.getAllByText('---')
    expect(dashes.length).toBeGreaterThanOrEqual(1)
  })

  it('should render wsRate', () => {
    render(<ServerInfoCard data={null} wsRate={24} />)
    expect(screen.getByText('24 msgs/sec')).toBeInTheDocument()
  })

  it('should render load average', () => {
    render(
      <ServerInfoCard
        data={{
          type: 'metrics',
          timestamp: Date.now(),
          hostname: 'server',
          kernel: '6.1.0',
          uptime: '1d',
          cpu: { overall: 10, cores: [10], temp: 40, model: 'X', speed: 2 },
          ram: { total: 8000, used: 4000, free: 4000, cached: 1000, percent: 50 },
          disk: {
            total: 250,
            used: 100,
            percent: 40,
            readSpeed: 50,
            writeSpeed: 30,
            device: 'sda',
            mountpoint: '/',
          },
          network: { rx: 100, tx: 50, interface: 'eth0' },
          processes: [],
          loadAvg: [0.5, 0.8, 1.2],
        }}
        wsRate={0}
      />,
    )
    expect(screen.getByText('0.50, 0.80, 1.20')).toBeInTheDocument()
  })
})
