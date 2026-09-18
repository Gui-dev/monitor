import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import type { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import type { KillProcessUseCase } from '../modules/metrics/use-cases/kill-process.use-case'

const ProcessInfoSchema = z.object({
  pid: z.number(),
  name: z.string(),
  user: z.string(),
  cpu: z.number(),
  mem: z.number(),
})

const KillProcessResponseSchema = z.object({
  pid: z.number(),
  signal: z.string(),
  success: z.boolean(),
})

export async function processesRoutes(
  app: FastifyInstance,
  deps: {
    getMetrics: GetMetricsUseCase
    killProcess: KillProcessUseCase
  },
) {
  app.get(
    '/api/processes',
    {
      schema: {
        description: 'Get top processes by CPU usage',
        tags: ['processes'],
        response: {
          200: z.array(ProcessInfoSchema),
        },
      },
    },
    async () => {
      const latest = await deps.getMetrics.getLatest()
      return latest?.processes ?? []
    },
  )

  app.post(
    '/api/processes/:pid/kill',
    {
      schema: {
        description: 'Kill a process by PID',
        tags: ['processes'],
        params: z.object({
          pid: z.coerce.number().int().positive(),
        }),
        response: {
          200: KillProcessResponseSchema,
          404: z.object({
            error: z.string(),
            message: z.string(),
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { pid } = request.params as { pid: number }
      const result = await deps.killProcess.execute(pid)
      return reply.send(result)
    },
  )
}
