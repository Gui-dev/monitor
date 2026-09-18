# PulseOS.node — Linux Server Monitoring Dashboard

## Overview

A real-time Linux server monitoring dashboard with a Fastify API server, hexagonal architecture, and Next.js cyberpunk-themed UI. Collects CPU/RAM/disk/network/processes via Node.js agent, persists metrics with Drizzle ORM, and streams real-time data via WebSocket.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| HTTP Server | Fastify + @fastify/websocket |
| API Validation | Zod + @fastify/type-provider-zod |
| API Docs | @fastify/swagger + @scalar/fastify-api-reference |
| ORM | Drizzle ORM (SQLite/PostgreSQL) |
| Architecture | Hexagonal (Ports & Adapters) |
| Test Framework | Vitest |
| Component Tests | React Testing Library + MSW v2 |
| E2E Tests | Playwright |
| Frontend | Next.js 14+ (App Router) |
| UI Components | shadcn/ui |
| Styling | Tailwind CSS |
| Linter/Formatter | BiomeJS |
| Shared Types | TypeScript (zero runtime deps) |

## Architecture

**Monorepo with pnpm workspaces + Hexagonal Architecture:**

```
monitor/
├── biome.jsonc                         # BiomeJS config
├── packages/
│   ├── shared/                         # Shared types & Zod schemas
│   │   └── src/
│   │       ├── types.ts                # Domain types
│   │       ├── schemas.ts              # Zod validation schemas
│   │       └── index.ts
│   ├── agent/                          # Fastify API + metric collector
│   │   └── src/
│   │       ├── index.ts                # Fastify server entry
│   │       ├── modules/
│   │       │   └── metrics/
│   │       │       ├── domain/
│   │       │       │   ├── metric.ts           # Entity types
│   │       │       │   ├── metric-repository.ts # Repository contract
│   │       │       │   └── domain-errors.ts    # Typed DomainError
│   │       │       ├── use-cases/
│   │       │       │   ├── collect-metrics.use-case.ts
│   │       │       │   ├── get-metrics.use-case.ts
│   │       │       │   └── kill-process.use-case.ts
│   │       │       └── infra/
│   │       │           ├── drizzle-metric-repository.ts
│   │       │           ├── in-memory-metric-repository.ts
│   │       │           └── collectors/
│   │       │               ├── cpu.ts
│   │       │               ├── ram.ts
│   │       │               ├── disk.ts
│   │       │               ├── network.ts
│   │       │               └── processes.ts
│   │       ├── routes/
│   │       │   ├── metrics.routes.ts    # REST endpoints
│   │       │   └── ws.routes.ts         # WebSocket handler
│   │       └── lib/
│   │           ├── errors.ts            # Fastify error handler
│   │           └── db.ts               # Drizzle client
│   ├── dashboard/                      # Next.js + shadcn/ui
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── lib/
│   └── e2e/                            # Playwright E2E tests
│       └── tests/
├── package.json
└── tsconfig.base.json
```

## API Design (Fastify)

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/metrics/current` | Latest metric snapshot |
| GET | `/api/metrics/history` | Historical metrics (paginated) |
| GET | `/api/processes` | Top processes |
| POST | `/api/processes/:pid/kill` | Kill a process |
| GET | `/api/health` | Health check |
| GET | `/docs` | Swagger UI |
| GET | `/docs/json` | OpenAPI JSON |

### WebSocket

| Event | Direction | Payload |
|-------|-----------|---------|
| `metrics` | Server → Client | `MetricPayload` (broadcast every 1s) |
| `pong` | Server → Client | Response to `--ping` |
| `status` | Server → Client | Agent status response |
| `kill_result` | Server → Client | Kill process result |

### Validation (Zod)

```typescript
import { z } from 'zod';

export const MetricPayloadSchema = z.object({
  type: z.literal('metrics'),
  timestamp: z.number(),
  hostname: z.string(),
  kernel: z.string(),
  uptime: z.string(),
  cpu: z.object({
    overall: z.number().min(0).max(100),
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
    percent: z.number().min(0).max(100),
  }),
  disk: z.object({
    total: z.number(),
    used: z.number(),
    percent: z.number().min(0).max(100),
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
  processes: z.array(z.object({
    pid: z.number(),
    name: z.string(),
    user: z.string(),
    cpu: z.number(),
    mem: z.number(),
  })),
  loadAvg: z.tuple([z.number(), z.number(), z.number()]),
});

export const KillProcessSchema = z.object({
  pid: z.number().int().positive(),
});
```

## Hexagonal Architecture

Each module follows:

```
module/
├── domain/
│   ├── entity.ts          # Types + domain errors
│   └── repository.ts      # Contract (interface)
├── use-cases/
│   └── *.use-case.ts      # Business logic (classes with execute())
└── infra/
    ├── drizzle-*.ts       # Production implementation
    └── in-memory-*.ts     # Test double (real logic, no mocks)
```

**Rules:**
- Dependencies injected via constructor
- Use cases throw `DomainError` (typed, not raw `Error`)
- In-memory repos implement same contract as production
- Unit tests use in-memory repos only (no I/O)

## Testing Strategy

### Unit Tests (in-memory)
- Co-located with source (`*.spec.ts`)
- In-memory repositories as test doubles
- Vitest with `beforeEach` for fresh instances
- Test factories for entity creation
- No `vi.mock` for repositories — use real in-memory implementations

### Component Tests
- Co-located (`*.spec.tsx`)
- React Testing Library + `@testing-library/user-event`
- MSW v2 for network boundary mocking
- Accessible queries (`getByRole`, `getByLabelText`)

### E2E Tests
- Centralized in `packages/e2e/tests/`
- Playwright with real browser
- Critical user journeys only
- Isolated data per test

## Dashboard UI

### shadcn/ui Components
- Card, Badge, Button, Table, Input, Progress
- Custom theme extending shadcn defaults with cyberpunk colors

### Color System (Tailwind)

| Token | Value |
|-------|-------|
| `bg-primary` | `#0a0a0f` |
| `bg-card` | `#12121a` |
| `accent` | `#f0b429` |
| `text` | `#e0e0e0` |
| `text-muted` | `#6b7280` |
| `success` | `#22c55e` |
| `warning` | `#f59e0b` |
| `danger` | `#ef4444` |
| `border` | `#1e1e2e` |

### Custom Components
1. `Header` — Agent name, version badge, nav tabs, WS status
2. `ServerInfoCard` — Hostname, kernel, uptime, load avg
3. `MetricCard` — CPU/RAM/Disk/Network with progress bars
4. `RealTimeChart` — Recharts area chart, 20s rolling window
5. `CoreCluster` — Per-core CPU usage grid
6. `ProcessTable` — Sortable table with kill button
7. `WSEventStream` — Terminal-style WS frame log + input
8. `StatusBadge` — Colored status pills
9. `GradientGauge` — Animated progress bars

## Dependencies

### Agent
- `fastify`, `@fastify/websocket`, `@fastify/swagger`, `@scalar/fastify-api-reference`
- `@fastify/type-provider-zod`, `zod`
- `drizzle-orm`, `drizzle-kit` (optional)
- `ws`

### Dashboard
- `next`, `react`, `react-dom`
- `recharts`
- `tailwindcss`, `postcss`, `autoprefixer`
- shadcn/ui components

### Testing
- `vitest`, `@vitest/coverage-v8`
- `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
- `msw`
- `@playwright/test`

### Dev Tools
- `@biomejs/biome`
- `tsx` (for dev server)
- `typescript`

## Security

- No authentication — localhost only
- Process kill requires explicit user confirmation
- Agent binds to localhost only
- Zod validation on all inputs
