import type { MetricPayload } from '@pulseos/shared'
import type { FastifyInstance } from 'fastify'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from '../modules/metrics/infra/in-memory-metric-repository'
import { CollectMetricsUseCase } from '../modules/metrics/use-cases/collect-metrics.use-case'
import { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import { buildServer } from '../server'
import { metricsRoutes } from './metrics.routes'

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

describe('Metrics Routes', () => {
  let app: FastifyInstance
  let repository: InMemoryMetricRepository

  beforeEach(async () => {
    if (app) await app.close()
    app = buildServer()
    repository = new InMemoryMetricRepository()
    const getMetrics = new GetMetricsUseCase(repository)
    const collectMetrics = new CollectMetricsUseCase(repository, 'test-host', '6.1.0', '1d 00:00')

    await app.register(metricsRoutes, { getMetrics, collectMetrics })
    await app.ready()
  })

  describe('GET /api/metrics/current', () => {
    it('should return 404 when no metrics exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/current',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.payload)
      expect(body.error).toBe('Not Found')
    })

    it('should return latest metrics', async () => {
      await repository.save(createMetricPayload({ hostname: 'first' }))
      await repository.save(createMetricPayload({ hostname: 'second' }))

      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/current',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.hostname).toBe('second')
    })
  })

  describe('GET /api/metrics/history', () => {
    it('should return empty array when no data', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/history',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body).toEqual([])
    })

    it('should return metrics with default limit', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/history',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.length).toBe(5)
    })

    it('should respect limit query parameter', async () => {
      for (let i = 0; i < 10; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const response = await app.inject({
        method: 'GET',
        url: '/api/metrics/history?limit=3',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.length).toBe(3)
    })
  })

  describe('POST /api/metrics/collect', () => {
    it('should collect and return metrics', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/metrics/collect',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.type).toBe('metrics')
      expect(body.hostname).toBe('test-host')
    })
  })
})
