import type { MetricPayload } from '@pulseos/shared'
import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import { InMemoryMetricRepository } from '../modules/metrics/infra/in-memory-metric-repository'
import { CollectMetricsUseCase } from '../modules/metrics/use-cases/collect-metrics.use-case'
import { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import { KillProcessUseCase } from '../modules/metrics/use-cases/kill-process.use-case'
import { buildServer } from '../server'
import { getConnectedClients, wsRoutes } from './ws.routes'

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

function waitForMessage(ws: WebSocket): Promise<object> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 5000)
    ws.once('message', (data) => {
      clearTimeout(timeout)
      resolve(JSON.parse(data.toString()))
    })
  })
}

describe('WebSocket Routes', () => {
  let app: FastifyInstance
  let repository: InMemoryMetricRepository
  let port: number

  beforeAll(async () => {
    app = buildServer()
    repository = new InMemoryMetricRepository()
    const collectMetrics = new CollectMetricsUseCase(repository, 'test-host', '6.1.0', '1d 00:00')
    const getMetrics = new GetMetricsUseCase(repository)
    const killProcess = new KillProcessUseCase()

    await app.register(wsRoutes, { collectMetrics, getMetrics, killProcess })
    await app.listen({ port: 0, host: '127.0.0.1' })
    port = (app.server.address() as { port: number }).port
  })

  afterAll(async () => {
    await app.close()
  })

  function createWsClient(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)
      ws.on('open', () => resolve(ws))
      ws.on('error', reject)
    })
  }

  it('should accept WebSocket connections', async () => {
    const ws = await createWsClient()
    expect(ws.readyState).toBe(WebSocket.OPEN)
    ws.close()
  })

  it('should respond to --ping with pong', async () => {
    const ws = await createWsClient()
    ws.send(JSON.stringify({ type: '--ping' }))
    const msg = (await waitForMessage(ws)) as { type: string; timestamp: number }
    expect(msg.type).toBe('pong')
    expect(typeof msg.timestamp).toBe('number')
    ws.close()
  })

  it('should respond to --status', async () => {
    await repository.save(createMetricPayload())
    const ws = await createWsClient()
    ws.send(JSON.stringify({ type: '--status' }))
    const msg = (await waitForMessage(ws)) as {
      type: string
      hostname: string
      connectedClients: number
    }
    expect(msg.type).toBe('status')
    expect(msg.hostname).toBe('test-host')
    expect(msg.connectedClients).toBeGreaterThanOrEqual(1)
    ws.close()
  })

  it('should respond to unknown command with error', async () => {
    const ws = await createWsClient()
    ws.send(JSON.stringify({ type: '--unknown' }))
    const msg = (await waitForMessage(ws)) as { type: string; message: string }
    expect(msg.type).toBe('error')
    expect(msg.message).toContain('Unknown command')
    ws.close()
  })

  it('should respond to invalid JSON with error', async () => {
    const ws = await createWsClient()
    ws.send('not json')
    const msg = (await waitForMessage(ws)) as { type: string; message: string }
    expect(msg.type).toBe('error')
    expect(msg.message).toBe('Invalid JSON')
    ws.close()
  })

  it('should track connected clients', async () => {
    const ws = await createWsClient()
    // Wait for connection to register
    await new Promise((r) => setTimeout(r, 50))
    const count = getConnectedClients()
    expect(count).toBeGreaterThanOrEqual(1)
    ws.close()
    await new Promise((r) => setTimeout(r, 50))
  })
})
