import type { FastifyInstance } from 'fastify'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'
import { buildServer } from './server'

describe('Server', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildServer()

    // Register health check for testing
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

    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /api/health', () => {
    it('should return 200 with status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/health',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.status).toBe('ok')
      expect(typeof body.timestamp).toBe('number')
      expect(typeof body.uptime).toBe('number')
    })
  })

  describe('GET /docs', () => {
    it('should serve Swagger UI', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs',
      })

      expect(response.statusCode).toBe(200)
    })
  })

  describe('GET /docs/json', () => {
    it('should return OpenAPI JSON', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs/json',
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)
      expect(body.openapi).toBeDefined()
      expect(body.info.title).toBe('PulseOS.node Agent API')
    })
  })
})
