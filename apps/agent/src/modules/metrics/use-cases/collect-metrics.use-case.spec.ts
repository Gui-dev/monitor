import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryMetricRepository } from '../infra/in-memory-metric-repository'
import { CollectMetricsUseCase } from './collect-metrics.use-case'

vi.mock('../infra/collectors/cpu', () => ({
  collectCpu: () => ({
    overall: 42,
    cores: [40, 45],
    temp: 55,
    model: 'Mock CPU',
    speed: 3200,
  }),
}))

vi.mock('../infra/collectors/ram', () => ({
  collectRam: () => ({
    total: 16e9,
    used: 8e9,
    free: 8e9,
    cached: 2e9,
    percent: 50,
  }),
}))

vi.mock('../infra/collectors/disk', () => ({
  collectDisk: () => ({
    total: 500e9,
    used: 250e9,
    percent: 50,
    readSpeed: 2e6,
    writeSpeed: 1e6,
    device: '/dev/nvme0n1',
    mountpoint: '/',
  }),
}))

vi.mock('../infra/collectors/network', () => ({
  collectNetwork: () => ({
    rx: 5e6,
    tx: 2e6,
    interface: 'eth0',
  }),
}))

vi.mock('../infra/collectors/processes', () => ({
  collectProcesses: () => [
    { pid: 100, name: 'node', user: 'root', cpu: 5.2, mem: 3.1 },
    { pid: 200, name: 'postgres', user: 'postgres', cpu: 2.1, mem: 8.5 },
  ],
}))

describe('CollectMetricsUseCase', () => {
  let repository: InMemoryMetricRepository
  let useCase: CollectMetricsUseCase

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
    useCase = new CollectMetricsUseCase(repository, 'test-host', '6.1.0', '1d 00:00')
  })

  it('should collect and return a metric payload', async () => {
    const payload = await useCase.execute()

    expect(payload.type).toBe('metrics')
    expect(payload.hostname).toBe('test-host')
    expect(payload.kernel).toBe('6.1.0')
    expect(payload.uptime).toBe('1d 00:00')
  })

  it('should include CPU metrics', async () => {
    const payload = await useCase.execute()

    expect(payload.cpu.overall).toBe(42)
    expect(payload.cpu.cores).toEqual([40, 45])
    expect(payload.cpu.temp).toBe(55)
    expect(payload.cpu.model).toBe('Mock CPU')
  })

  it('should include RAM metrics', async () => {
    const payload = await useCase.execute()

    expect(payload.ram.total).toBe(16e9)
    expect(payload.ram.used).toBe(8e9)
    expect(payload.ram.percent).toBe(50)
  })

  it('should include disk metrics', async () => {
    const payload = await useCase.execute()

    expect(payload.disk.device).toBe('/dev/nvme0n1')
    expect(payload.disk.percent).toBe(50)
  })

  it('should include network metrics', async () => {
    const payload = await useCase.execute()

    expect(payload.network.rx).toBe(5e6)
    expect(payload.network.interface).toBe('eth0')
  })

  it('should include process list', async () => {
    const payload = await useCase.execute()

    expect(payload.processes).toHaveLength(2)
    expect(payload.processes[0].name).toBe('node')
  })

  it('should include load average', async () => {
    const payload = await useCase.execute()

    expect(payload.loadAvg).toHaveLength(3)
    expect(typeof payload.loadAvg[0]).toBe('number')
  })

  it('should persist metrics in the repository', async () => {
    await useCase.execute()

    const latest = await repository.findLatest()
    expect(latest?.hostname).toBe('test-host')
  })

  it('should produce unique timestamps', async () => {
    const first = await useCase.execute()
    const second = await useCase.execute()

    expect(second.timestamp).toBeGreaterThanOrEqual(first.timestamp)
  })
})
