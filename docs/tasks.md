# PulseOS.node — Tasks

> Checklist de implementação. Marque ✅ cada task ao completar.

## Setup

- [x] **Task 1:** Monorepo scaffolding + BiomeJS
- [x] **Task 2:** Shared types + Zod schemas
- [x] **Task 3:** Install all dependencies

## Agent — Domain Layer

- [x] **Task 4:** Agent package setup
- [x] **Task 5:** Domain layer (entities, repository contract, DomainError)
- [x] **Task 6:** In-memory repository + unit tests

## Agent — Use Cases

- [x] **Task 7:** CollectMetricsUseCase + tests
- [x] **Task 8:** GetMetricsUseCase + tests
- [x] **Task 9:** KillProcessUseCase + tests

## Agent — Infrastructure

- [x] **Task 10:** Metric collectors (CPU, RAM, Disk, Network, Processes)
- [x] **Task 11:** Drizzle config + schema (optional persistence)

## Agent — API Layer

- [x] **Task 12:** Fastify server setup + Swagger + error handler
- [x] **Task 13:** REST routes (metrics, processes, health)
- [x] **Task 14:** WebSocket routes + broadcast

## Dashboard — Setup

- [x] **Task 15:** Next.js + Tailwind + shadcn/ui setup
- [x] **Task 16:** Global styles + theme (cyberpunk colors)
- [x] **Task 17:** Vitest workspace config

## Dashboard — Components

- [x] **Task 18:** StatusBadge + tests
- [x] **Task 19:** Header + tests
- [x] **Task 20:** ServerInfoCard + MetricCard + GradientGauge
- [x] **Task 21:** RealTimeChart (Recharts)
- [x] **Task 22:** CoreCluster
- [x] **Task 23:** ProcessTable + tests
- [x] **Task 24:** WSEventStream

## Dashboard — Integration

- [x] **Task 25:** useWebSocket hook + tests
- [x] **Task 26:** Main page + layout assembly

## Agent — E2E Tests

- [x] **Task 27:** Playwright setup + config (apps/agent)
- [x] **Task 28:** Metrics API E2E tests

## Dashboard — E2E Tests

- [x] **Task 29:** Playwright setup + config (apps/dashboard)
- [x] **Task 30:** Dashboard E2E tests

## Final

- [x] **Task 31:** Build, lint, typecheck verification
- [x] **Task 32:** Integration smoke test
