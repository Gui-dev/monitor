import type { MetricPayload } from '@pulseos/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from '../infra/in-memory-metric-repository'
import { GetMetricsUseCase } from './get-metrics.use-case'

function createMetricPayload(overrides: Partial<MetricPayload> = {}): MetricPayload {
  return {
    type: 'metrics',
    timestamp: Date.now(),
    hostname: 'test-host',
    kernel: '6.1.0',
    uptime: '1d 00:00',
    cpu: { overall: 50, cores: [50], model: 'Test', speed: 3000 },
    ram: { total: 8e9, used: 4e9, free: 4e9, cached: 1e9, percent: 50 },
    disk: {
      total: 100e9,
      used: 50e9,
      percent: 50,
      readSpeed: 1e6,
      writeSpeed: 5e5,
      device: '/dev/sda',
      mountpoint: '/',
    },
    network: { rx: 1e6, tx: 5e5, interface: 'eth0' },
    processes: [{ pid: 1, name: 'init', user: 'root', cpu: 0.1, mem: 0.5 }],
    loadAvg: [1.0, 1.0, 1.0],
    ...overrides,
  }
}

describe('GetMetricsUseCase', () => {
  let repository: InMemoryMetricRepository
  let useCase: GetMetricsUseCase

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
    useCase = new GetMetricsUseCase(repository)
  })

  describe('getLatest', () => {
    it('should return null when no metrics exist', async () => {
      expect(await useCase.getLatest()).toBeNull()
    })

    it('should return the most recent metric', async () => {
      await repository.save(createMetricPayload({ hostname: 'first' }))
      await repository.save(createMetricPayload({ hostname: 'second' }))

      const latest = await useCase.getLatest()
      expect(latest?.hostname).toBe('second')
    })
  })

  describe('getHistory', () => {
    it('should return empty array when no data', async () => {
      expect(await useCase.getHistory(10)).toEqual([])
    })

    it('should return metrics up to the limit', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const history = await useCase.getHistory(3)
      expect(history.length).toBe(3)
      expect(history[0].timestamp).toBe(2)
    })
  })
})
