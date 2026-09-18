import type { MetricPayload } from '@pulseos/shared'
import type { FastifyInstance } from 'fastify'
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from '../modules/metrics/infra/in-memory-metric-repository'
import { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import { KillProcessUseCase } from '../modules/metrics/use-cases/kill-process.use-case'
import { buildServer } from '../server'
import { processesRoutes } from './processes.routes'

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
    processes: [
      { pid: 100, name: 'node', user: 'root', cpu: 5.2, mem: 3.1 },
      { pid: 200, name: 'postgres', user: 'postgres', cpu: 2.1, mem: 8.5 },
    ],
    loadAvg: [1.0, 1.0, 1.0],
    ...overrides,
  }
}

describe('Processes Routes', () => {
  let app: FastifyInstance
  let repository: InMemoryMetricRepository

  beforeEach(async () => {
    if (app) await app.close()
    app = buildServer()
    repository = new InMemoryMetricRepository()
    const getMetrics = new GetMetricsUseCase(repository)
    const killProcess = new KillProcessUseCase()

    await app.register(processesRoutes, { getMetrics, killProcess })
    await app.ready()
  })

  describe('GET /api/processes', () => {
    it('should return empty array when no metrics exist', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/processes',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body).toEqual([])
    })

    it('should return processes from latest metrics', async () => {
      await repository.save(createMetricPayload())

      const response = await app.inject({
        method: 'GET',
        url: '/api/processes',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.length).toBe(2)
      expect(body[0].name).toBe('node')
    })
  })

  describe('POST /api/processes/:pid/kill', () => {
    it('should return 404 for non-existent process', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/processes/999999999/kill',
      })

      expect(response.statusCode).toBe(404)
      const body = JSON.parse(response.payload)
      expect(body.code).toBe('PROCESS_NOT_FOUND')
    })

    it('should kill a real process', async () => {
      const { spawn } = await import('node:child_process')
      const child = spawn('sleep', ['30'])
      const pid = child.pid!

      const response = await app.inject({
        method: 'POST',
        url: `/api/processes/${pid}/kill`,
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.pid).toBe(pid)
      expect(body.success).toBe(true)
    })
  })
})
