import os from 'node:os'
import { z } from 'zod'
import { InMemoryMetricRepository } from './modules/metrics/infra/in-memory-metric-repository'
import { CollectMetricsUseCase } from './modules/metrics/use-cases/collect-metrics.use-case'
import { GetMetricsUseCase } from './modules/metrics/use-cases/get-metrics.use-case'
import { KillProcessUseCase } from './modules/metrics/use-cases/kill-process.use-case'
import { buildServer } from './server'

const PORT = Number(process.env.PORT) || 3001
const HOST = process.env.HOST || '0.0.0.0'

async function main() {
  const app = buildServer()

  // Initialize dependencies
  const repository = new InMemoryMetricRepository()
  const collectMetrics = new CollectMetricsUseCase(
    repository,
    os.hostname(),
    os.release(),
    formatUptime(os.uptime()),
  )
  const getMetrics = new GetMetricsUseCase(repository)
  const killProcess = new KillProcessUseCase()

  // Make dependencies available to routes
  app.decorate('repository', repository)
  app.decorate('collectMetrics', collectMetrics)
  app.decorate('getMetrics', getMetrics)
  app.decorate('killProcess', killProcess)

  // Health check
  app.get(
    '/api/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['health'],
        response: {
          200: z.object({
            status: z.string(),
            timestamp: z.number(),
            uptime: z.number(),
          }),
        },
      },
    },
    () => ({
      status: 'ok',
      timestamp: Date.now(),
      uptime: process.uptime(),
    }),
  )

  await app.listen({ port: PORT, host: HOST })
  app.log.info(`Server running at http://${HOST}:${PORT}`)
  app.log.info(`API docs at http://${HOST}:${PORT}/docs`)
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${days}d ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
