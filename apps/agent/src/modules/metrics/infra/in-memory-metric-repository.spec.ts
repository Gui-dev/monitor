import type { MetricPayload } from '@pulseos/shared'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from './in-memory-metric-repository'

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

describe('InMemoryMetricRepository', () => {
  let repository: InMemoryMetricRepository

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
  })

  describe('save', () => {
    it('should store a metric payload', async () => {
      const payload = createMetricPayload()
      await repository.save(payload)

      const latest = await repository.findLatest()
      expect(latest?.hostname).toBe('test-host')
    })

    it('should limit history to 200 entries', async () => {
      for (let i = 0; i < 250; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const history = await repository.findHistory(300)
      expect(history.length).toBe(200)
      expect(history[0].timestamp).toBe(50)
    })
  })

  describe('findLatest', () => {
    it('should return null when empty', async () => {
      expect(await repository.findLatest()).toBeNull()
    })

    it('should return the most recent payload', async () => {
      await repository.save(createMetricPayload({ hostname: 'first' }))
      await repository.save(createMetricPayload({ hostname: 'second' }))

      const latest = await repository.findLatest()
      expect(latest?.hostname).toBe('second')
    })
  })

  describe('findHistory', () => {
    it('should return empty array when no data', async () => {
      expect(await repository.findHistory(10)).toEqual([])
    })

    it('should return up to limit entries', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const history = await repository.findHistory(3)
      expect(history.length).toBe(3)
      expect(history[0].timestamp).toBe(2)
    })

    it('should return all entries if limit exceeds stored count', async () => {
      await repository.save(createMetricPayload({ timestamp: 1 }))
      await repository.save(createMetricPayload({ timestamp: 2 }))

      const history = await repository.findHistory(10)
      expect(history.length).toBe(2)
    })
  })
})
