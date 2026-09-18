import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { CollectMetricsUseCase } from '../modules/metrics/use-cases/collect-metrics.use-case'
import type { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'

const MetricPayloadSchema = z.object({
  type: z.literal('metrics'),
  timestamp: z.number(),
  hostname: z.string(),
  kernel: z.string(),
  uptime: z.string(),
  cpu: z.object({
    overall: z.number(),
    cores: z.array(z.number()),
    temp: z.number().optional(),
    model: z.string(),
    speed: z.number(),
  }),
  ram: z.object({
    total: z.number(),
    used: z.number(),
    free: z.number(),
    cached: z.number(),
    percent: z.number(),
  }),
  disk: z.object({
    total: z.number(),
    used: z.number(),
    percent: z.number(),
    readSpeed: z.number(),
    writeSpeed: z.number(),
    device: z.string(),
    mountpoint: z.string(),
  }),
  network: z.object({
    rx: z.number(),
    tx: z.number(),
    interface: z.string(),
  }),
  processes: z.array(
    z.object({
      pid: z.number(),
      name: z.string(),
      user: z.string(),
      cpu: z.number(),
      mem: z.number(),
    }),
  ),
  loadAvg: z.array(z.number()),
})

export async function metricsRoutes(
  app: FastifyInstance,
  deps: {
    getMetrics: GetMetricsUseCase
    collectMetrics: CollectMetricsUseCase
  },
) {
  app.get(
    '/api/metrics/current',
    {
      schema: {
        description: 'Get latest metric snapshot',
        tags: ['metrics'],
        response: {
          200: MetricPayloadSchema,
          404: z.object({
            error: z.string(),
            message: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      const latest = await deps.getMetrics.getLatest()
      if (!latest) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'No metrics collected yet',
        })
      }
      return reply.send(latest)
    },
  )

  app.get(
    '/api/metrics/history',
    {
      schema: {
        description: 'Get historical metrics',
        tags: ['metrics'],
        querystring: z.object({
          limit: z.coerce.number().int().min(1).max(200).default(50),
        }),
        response: {
          200: z.array(MetricPayloadSchema),
        },
      },
    },
    async (request) => {
      const { limit } = request.query as { limit: number }
      const history = await deps.getMetrics.getHistory(limit)
      return history
    },
  )

  app.post(
    '/api/metrics/collect',
    {
      schema: {
        description: 'Manually trigger metric collection',
        tags: ['metrics'],
        response: {
          200: MetricPayloadSchema,
        },
      },
    },
    async () => {
      const payload = await deps.collectMetrics.execute()
      return payload
    },
  )
}
