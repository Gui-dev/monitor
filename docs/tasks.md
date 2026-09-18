# PulseOS.node — Tasks

> Checklist de implementação. Marque ✅ cada task ao completar.

## Setup

- [x] **Task 1:** Monorepo scaffolding + BiomeJS
- [x] **Task 2:** Shared types + Zod schemas
- [x] **Task 3:** Install all dependencies

## Agent — Domain Layer

- [x] **Task 4:** Agent package setup
- [ ] **Task 5:** Domain layer (entities, repository contract, DomainError)
- [ ] **Task 6:** In-memory repository + unit tests

## Agent — Use Cases

- [ ] **Task 7:** CollectMetricsUseCase + tests
- [ ] **Task 8:** GetMetricsUseCase + tests
- [ ] **Task 9:** KillProcessUseCase + tests

## Agent — Infrastructure

- [ ] **Task 10:** Metric collectors (CPU, RAM, Disk, Network, Processes)
- [ ] **Task 11:** Drizzle config + schema (optional persistence)

## Agent — API Layer

- [ ] **Task 12:** Fastify server setup + Swagger + error handler
- [ ] **Task 13:** REST routes (metrics, processes, health)
- [ ] **Task 14:** WebSocket routes + broadcast

## Dashboard — Setup

- [ ] **Task 15:** Next.js + Tailwind + shadcn/ui setup
- [ ] **Task 16:** Global styles + theme (cyberpunk colors)
- [ ] **Task 17:** Vitest workspace config

## Dashboard — Components

- [ ] **Task 18:** StatusBadge + tests
- [ ] **Task 19:** Header + tests
- [ ] **Task 20:** ServerInfoCard + MetricCard + GradientGauge
- [ ] **Task 21:** RealTimeChart (Recharts)
- [ ] **Task 22:** CoreCluster
- [ ] **Task 23:** ProcessTable + tests
- [ ] **Task 24:** WSEventStream

## Dashboard — Integration

- [ ] **Task 25:** useWebSocket hook + tests
- [ ] **Task 26:** Main page + layout assembly

## Agent — E2E Tests

- [ ] **Task 27:** Playwright setup + config (apps/agent)
- [ ] **Task 28:** Metrics API E2E tests

## Dashboard — E2E Tests

- [ ] **Task 29:** Playwright setup + config (apps/dashboard)
- [ ] **Task 30:** Dashboard E2E tests

## Final

- [ ] **Task 31:** Build, lint, typecheck verification
- [ ] **Task 32:** Integration smoke test
