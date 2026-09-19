import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from '@fastify/type-provider-zod'
import websocket from '@fastify/websocket'
import scalar from '@scalar/fastify-api-reference'
import Fastify from 'fastify'
import {
  DomainError,
  MetricCollectionError,
  ProcessNotFoundError,
} from './modules/metrics/domain/domain-errors'

export function buildServer() {
  const app = Fastify({
    logger:
      process.env.NODE_ENV === 'test'
        ? false
        : {
            level: 'info',
            transport: {
              target: 'pino-pretty',
              options: { colorize: true },
            },
          },
  })

  // Zod validation
  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.withTypeProvider<ZodTypeProvider>()

  // CORS
  app.register(cors, { origin: true })

  // WebSocket
  app.register(websocket)

  // Swagger
  app.register(swagger, {
    openapi: {
      info: {
        title: 'PulseOS.node Agent API',
        description: 'Real-time Linux server monitoring API',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3001' }],
    },
  })

  app.register(scalar, {
    routePrefix: '/docs',
    configuration: {
      title: 'PulseOS.node Agent API',
    },
  })

  // Error handler
  app.setErrorHandler(
    (error: Error & { validation?: unknown; statusCode?: number }, _request, reply) => {
      if (error instanceof ProcessNotFoundError) {
        return reply.status(404).send({
          error: 'Not Found',
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof MetricCollectionError) {
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: error.message,
          code: error.code,
        })
      }

      if (error instanceof DomainError) {
        return reply.status(error.statusCode).send({
          error: 'Error',
          message: error.message,
          code: error.code,
        })
      }

      // Zod validation errors
      if (error.validation) {
        return reply.status(400).send({
          error: 'Bad Request',
          message: 'Validation error',
          details: error.validation,
        })
      }

      app.log.error(error)
      return reply.status(500).send({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      })
    },
  )

  return app
}
