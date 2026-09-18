import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'
import type { CollectMetricsUseCase } from '../modules/metrics/use-cases/collect-metrics.use-case'
import type { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import type { KillProcessUseCase } from '../modules/metrics/use-cases/kill-process.use-case'

const clients = new Set<WebSocket>()

export function broadcastMetrics(payload: object) {
  const data = JSON.stringify(payload)
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(data)
    }
  }
}

export function getConnectedClients(): number {
  return clients.size
}

export async function wsRoutes(
  app: FastifyInstance,
  deps: {
    collectMetrics: CollectMetricsUseCase
    getMetrics: GetMetricsUseCase
    killProcess: KillProcessUseCase
  },
) {
  app.get('/ws', { websocket: true }, (socket: WebSocket) => {
    clients.add(socket)
    app.log.info(`WebSocket client connected (${clients.size} total)`)

    socket.on('message', async (raw: Buffer) => {
      try {
        const message = JSON.parse(raw.toString())

        switch (message.type) {
          case '--ping': {
            socket.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
            break
          }
          case '--status': {
            const latest = await deps.getMetrics.getLatest()
            socket.send(
              JSON.stringify({
                type: 'status',
                hostname: latest?.hostname ?? 'unknown',
                uptime: latest?.uptime ?? '0d 00:00',
                connectedClients: clients.size,
                timestamp: Date.now(),
              }),
            )
            break
          }
          case '--kill': {
            if (typeof message.pid === 'number') {
              try {
                const result = await deps.killProcess.execute(message.pid)
                socket.send(JSON.stringify({ type: 'kill_result', ...result }))
              } catch (err) {
                socket.send(
                  JSON.stringify({
                    type: 'kill_result',
                    pid: message.pid,
                    signal: '',
                    success: false,
                    error: err instanceof Error ? err.message : 'Unknown error',
                  }),
                )
              }
            }
            break
          }
          case '--collect': {
            const payload = await deps.collectMetrics.execute()
            broadcastMetrics(payload)
            break
          }
          default: {
            socket.send(
              JSON.stringify({
                type: 'error',
                message: `Unknown command: ${message.type}`,
              }),
            )
          }
        }
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }))
      }
    })

    socket.on('close', () => {
      clients.delete(socket)
      app.log.info(`WebSocket client disconnected (${clients.size} remaining)`)
    })

    socket.on('error', (err) => {
      app.log.error(err, 'WebSocket error')
      clients.delete(socket)
    })
  })
}
