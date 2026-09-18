# PulseOS.node Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time Linux server monitoring dashboard with Fastify, hexagonal architecture, full test suite, and cyberpunk UI.

**Architecture:** Monorepo with npm workspaces. Fastify server with hexagonal modules (domain/use-cases/infra), Drizzle ORM, Zod validation, Swagger docs. Next.js dashboard with shadcn/ui and Tailwind. Tests at unit (in-memory), component (RTL+MSW), and E2E (Playwright) levels.

**Tech Stack:** Fastify, Zod, Drizzle ORM, Vitest, React Testing Library, MSW v2, Playwright, Next.js, shadcn/ui, Tailwind CSS, BiomeJS

---

## File Structure

```
monitor/
├── biome.jsonc
├── package.json
├── tsconfig.base.json
├── vitest.workspace.ts
├── packages/
│   ├── shared/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── types.ts
│   │       ├── schemas.ts
│   │       └── index.ts
│   ├── agent/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   └── src/
│   │       ├── index.ts
│   │       ├── lib/
│   │       │   ├── errors.ts
│   │       │   └── db.ts
│   │       ├── modules/metrics/
│   │       │   ├── domain/
│   │       │   │   ├── metric.ts
│   │       │   │   ├── metric.ts.spec.ts
│   │       │   │   ├── metric-repository.ts
│   │       │   │   └── domain-errors.ts
│   │       │   ├── use-cases/
│   │       │   │   ├── collect-metrics.use-case.ts
│   │       │   │   ├── collect-metrics.use-case.spec.ts
│   │       │   │   ├── get-metrics.use-case.ts
│   │       │   │   ├── get-metrics.use-case.spec.ts
│   │       │   │   ├── kill-process.use-case.ts
│   │       │   │   └── kill-process.use-case.spec.ts
│   │       │   └── infra/
│   │       │       ├── in-memory-metric-repository.ts
│   │       │       ├── in-memory-metric-repository.spec.ts
│   │       │       ├── drizzle-metric-repository.ts
│   │       │       └── collectors/
│   │       │           ├── cpu.ts
│   │       │           ├── ram.ts
│   │       │           ├── disk.ts
│   │       │           ├── network.ts
│   │       │           └── processes.ts
│   │       └── routes/
│   │           ├── metrics.routes.ts
│   │           └── ws.routes.ts
│   ├── dashboard/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   ├── next.config.js
│   │   ├── components.json
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ui/              # shadcn components
│   │   │   ├── Header.tsx
│   │   │   ├── Header.spec.tsx
│   │   │   ├── ServerInfoCard.tsx
│   │   │   ├── MetricCard.tsx
│   │   │   ├── RealTimeChart.tsx
│   │   │   ├── CoreCluster.tsx
│   │   │   ├── ProcessTable.tsx
│   │   │   ├── ProcessTable.spec.tsx
│   │   │   ├── WSEventStream.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   └── GradientGauge.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useWebSocket.spec.ts
│   │   └── lib/
│   │       └── utils.ts
│   └── e2e/
│       ├── package.json
│       ├── playwright.config.ts
│       └── tests/
│           ├── dashboard.spec.ts
│           └── metrics-api.spec.ts
```

---

## Task 1: Project Scaffolding — Monorepo + BiomeJS

**Files:**
- Create: `package.json`
- Create: `tsconfig.base.json`
- Create: `biome.jsonc`

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "pulseos-node",
  "private": true,
  "workspaces": [
    "packages/shared",
    "packages/agent",
    "packages/dashboard",
    "packages/e2e"
  ],
  "scripts": {
    "dev:agent": "npm run dev --workspace=packages/agent",
    "dev:dashboard": "npm run dev --workspace=packages/dashboard",
    "build": "npm run build --workspaces",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write .",
    "typecheck": "tsc --noEmit -p packages/agent/tsconfig.json && tsc --noEmit -p packages/dashboard/tsconfig.json"
  }
}
```

- [ ] **Step 2: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist"
  }
}
```

- [ ] **Step 3: Create biome.jsonc**

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "warn",
        "noUnusedVariables": "warn"
      },
      "style": {
        "noNonNullAssertion": "off"
      },
      "suspicious": {
        "noExplicitAny": "off"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".next", "coverage"]
  }
}
```

- [ ] **Step 4: Init git and commit**

```bash
git init && git add -A && git commit -m "chore: initialize monorepo with BiomeJS"
```

---

## Task 2: Shared Types + Zod Schemas

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/src/types.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/index.ts`

- [ ] **Step 1: Create shared package.json**

```json
{
  "name": "@pulseos/shared",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0"
  }
}
```

- [ ] **Step 2: Create shared tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write types.ts**

```typescript
export interface CpuMetrics {
  overall: number
  cores: number[]
  temp?: number
  model: string
  speed: number
}

export interface RamMetrics {
  total: number
  used: number
  free: number
  cached: number
  percent: number
}

export interface DiskMetrics {
  total: number
  used: number
  percent: number
  readSpeed: number
  writeSpeed: number
  device: string
  mountpoint: string
}

export interface NetworkMetrics {
  rx: number
  tx: number
  interface: string
}

export interface ProcessInfo {
  pid: number
  name: string
  user: string
  cpu: number
  mem: number
}

export interface MetricPayload {
  type: 'metrics'
  timestamp: number
  hostname: string
  kernel: string
  uptime: string
  cpu: CpuMetrics
  ram: RamMetrics
  disk: DiskMetrics
  network: NetworkMetrics
  processes: ProcessInfo[]
  loadAvg: [number, number, number]
}

export interface WSResponse {
  type: 'pong' | 'status' | 'kill_result'
  data: unknown
}

export type WSCommand = '--ping' | '--status' | `kill:${number}`
```

- [ ] **Step 4: Write schemas.ts**

```typescript
import { z } from 'zod'

export const CpuMetricsSchema = z.object({
  overall: z.number().min(0).max(100),
  cores: z.array(z.number()),
  temp: z.number().optional(),
  model: z.string(),
  speed: z.number(),
})

export const RamMetricsSchema = z.object({
  total: z.number(),
  used: z.number(),
  free: z.number(),
  cached: z.number(),
  percent: z.number().min(0).max(100),
})

export const DiskMetricsSchema = z.object({
  total: z.number(),
  used: z.number(),
  percent: z.number().min(0).max(100),
  readSpeed: z.number(),
  writeSpeed: z.number(),
  device: z.string(),
  mountpoint: z.string(),
})

export const NetworkMetricsSchema = z.object({
  rx: z.number(),
  tx: z.number(),
  interface: z.string(),
})

export const ProcessInfoSchema = z.object({
  pid: z.number(),
  name: z.string(),
  user: z.string(),
  cpu: z.number(),
  mem: z.number(),
})

export const MetricPayloadSchema = z.object({
  type: z.literal('metrics'),
  timestamp: z.number(),
  hostname: z.string(),
  kernel: z.string(),
  uptime: z.string(),
  cpu: CpuMetricsSchema,
  ram: RamMetricsSchema,
  disk: DiskMetricsSchema,
  network: NetworkMetricsSchema,
  processes: z.array(ProcessInfoSchema),
  loadAvg: z.tuple([z.number(), z.number(), z.number()]),
})

export const KillProcessSchema = z.object({
  pid: z.number().int().positive(),
})
```

- [ ] **Step 5: Write index.ts**

```typescript
export type {
  CpuMetrics,
  RamMetrics,
  DiskMetrics,
  NetworkMetrics,
  ProcessInfo,
  MetricPayload,
  WSResponse,
  WSCommand,
} from './types'

export {
  MetricPayloadSchema,
  KillProcessSchema,
  ProcessInfoSchema,
} from './schemas'
```

- [ ] **Step 6: Commit**

```bash
git add packages/shared/
git commit -m "feat: add shared types and Zod validation schemas"
```

---

## Task 3: Agent Domain Layer

**Files:**
- Create: `packages/agent/package.json`
- Create: `packages/agent/tsconfig.json`
- Create: `packages/agent/src/modules/metrics/domain/metric.ts`
- Create: `packages/agent/src/modules/metrics/domain/metric-repository.ts`
- Create: `packages/agent/src/modules/metrics/domain/domain-errors.ts`

- [ ] **Step 1: Create agent package.json**

```json
{
  "name": "@pulseos/agent",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "@pulseos/shared": "*",
    "fastify": "^4.26.0",
    "@fastify/websocket": "^10.0.0",
    "@fastify/swagger": "^8.15.0",
    "@fastify/swagger-ui": "^4.0.0",
    "@fastify/cors": "^9.0.0",
    "@fastify/type-provider-zod": "^2.0.0",
    "zod": "^3.22.0",
    "drizzle-orm": "^0.30.0",
    "ws": "^8.16.0"
  },
  "devDependencies": {
    "@types/ws": "^8.5.10",
    "@types/node": "^20.11.0",
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0",
    "drizzle-kit": "^0.21.0"
  }
}
```

- [ ] **Step 2: Create agent tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 3: Write domain-errors.ts**

```typescript
export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 400,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class ProcessNotFoundError extends DomainError {
  constructor(pid: number) {
    super('PROCESS_NOT_FOUND', `Process ${pid} not found`, 404)
  }
}

export class MetricCollectionError extends DomainError {
  constructor(metric: string, cause?: string) {
    super('METRIC_COLLECTION_ERROR', `Failed to collect ${metric}${cause ? `: ${cause}` : ''}`, 500)
  }
}
```

- [ ] **Step 4: Write metric.ts**

```typescript
import type { MetricPayload, ProcessInfo } from '@pulseos/shared'

export type { MetricPayload, ProcessInfo }
```

- [ ] **Step 5: Write metric-repository.ts**

```typescript
import type { MetricPayload } from '@pulseos/shared'

export interface MetricRepository {
  save(payload: MetricPayload): Promise<void>
  findLatest(): Promise<MetricPayload | null>
  findHistory(limit: number): Promise<MetricPayload[]>
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/agent/
git commit -m "feat: add agent domain layer with MetricRepository contract and DomainError"
```

---

## Task 4: Agent In-Memory Repository + Unit Tests

**Files:**
- Create: `packages/agent/src/modules/metrics/infra/in-memory-metric-repository.ts`
- Create: `packages/agent/src/modules/metrics/infra/in-memory-metric-repository.spec.ts`

- [ ] **Step 1: Write in-memory-metric-repository.ts**

```typescript
import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'

export class InMemoryMetricRepository implements MetricRepository {
  private metrics: MetricPayload[] = []
  private maxHistory = 200

  async save(payload: MetricPayload): Promise<void> {
    this.metrics.push(payload)
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift()
    }
  }

  async findLatest(): Promise<MetricPayload | null> {
    return this.metrics[this.metrics.length - 1] ?? null
  }

  async findHistory(limit: number): Promise<MetricPayload[]> {
    return this.metrics.slice(-limit)
  }
}
```

- [ ] **Step 2: Write in-memory-metric-repository.spec.ts**

```typescript
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from './in-memory-metric-repository'
import type { MetricPayload } from '@pulseos/shared'

function createMetricPayload(overrides: Partial<MetricPayload> = {}): MetricPayload {
  return {
    type: 'metrics',
    timestamp: Date.now(),
    hostname: 'test-host',
    kernel: '6.1.0',
    uptime: '1d 00:00',
    cpu: { overall: 50, cores: [50], model: 'Test', speed: 3000 },
    ram: { total: 8000000000, used: 4000000000, free: 4000000000, cached: 1000000000, percent: 50 },
    disk: { total: 100000000000, used: 50000000000, percent: 50, readSpeed: 1000000, writeSpeed: 500000, device: '/dev/sda', mountpoint: '/' },
    network: { rx: 1000000, tx: 500000, interface: 'eth0' },
    processes: [{ pid: 1, name: 'init', user: 'root', cpu: 0.1, mem: 0.5 }],
    loadAvg: [1.0, 1.0, 1.0],
    ...overrides,
  }
}

describe('InMemoryMetricRepository', () => {
  let repository: InMemoryMetricRepository

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
  })

  describe('save', () => {
    it('should store a metric payload', async () => {
      const payload = createMetricPayload()
      await repository.save(payload)

      const latest = await repository.findLatest()
      expect(latest?.hostname).toBe('test-host')
    })

    it('should limit history to 200 entries', async () => {
      for (let i = 0; i < 250; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const history = await repository.findHistory(300)
      expect(history.length).toBe(200)
      expect(history[0].timestamp).toBe(50)
    })
  })

  describe('findLatest', () => {
    it('should return null when empty', async () => {
      expect(await repository.findLatest()).toBeNull()
    })

    it('should return the most recent payload', async () => {
      await repository.save(createMetricPayload({ hostname: 'first' }))
      await repository.save(createMetricPayload({ hostname: 'second' }))

      const latest = await repository.findLatest()
      expect(latest?.hostname).toBe('second')
    })
  })

  describe('findHistory', () => {
    it('should return empty array when no data', async () => {
      expect(await repository.findHistory(10)).toEqual([])
    })

    it('should return up to limit entries', async () => {
      for (let i = 0; i < 5; i++) {
        await repository.save(createMetricPayload({ timestamp: i }))
      }

      const history = await repository.findHistory(3)
      expect(history.length).toBe(3)
      expect(history[0].timestamp).toBe(2)
    })
  })
})
```

- [ ] **Step 3: Run tests**

Run: `npm run test --workspace=packages/agent -- --run src/modules/metrics/infra/in-memory-metric-repository.spec.ts`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add packages/agent/src/modules/metrics/infra/
git commit -m "feat: add InMemoryMetricRepository with unit tests"
```

---

## Task 5: Agent Use Cases + Tests

**Files:**
- Create: `packages/agent/src/modules/metrics/use-cases/collect-metrics.use-case.ts`
- Create: `packages/agent/src/modules/metrics/use-cases/collect-metrics.use-case.spec.ts`
- Create: `packages/agent/src/modules/metrics/use-cases/get-metrics.use-case.ts`
- Create: `packages/agent/src/modules/metrics/use-cases/get-metrics.use-case.spec.ts`
- Create: `packages/agent/src/modules/metrics/use-cases/kill-process.use-case.ts`
- Create: `packages/agent/src/modules/metrics/use-cases/kill-process.use-case.spec.ts`

- [ ] **Step 1: Write collect-metrics.use-case.ts**

```typescript
import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'
import { collectCpu } from '../infra/collectors/cpu'
import { collectRam } from '../infra/collectors/ram'
import { collectDisk } from '../infra/collectors/disk'
import { collectNetwork } from '../infra/collectors/network'
import { collectProcesses } from '../infra/collectors/processes'
import os from 'os'

export class CollectMetricsUseCase {
  constructor(
    private readonly repository: MetricRepository,
    private readonly hostname: string,
    private readonly kernel: string,
    private readonly uptime: string,
  ) {}

  async execute(): Promise<MetricPayload> {
    const payload: MetricPayload = {
      type: 'metrics',
      timestamp: Date.now(),
      hostname: this.hostname,
      kernel: this.kernel,
      uptime: this.uptime,
      cpu: collectCpu(),
      ram: collectRam(),
      disk: collectDisk(),
      network: collectNetwork(),
      processes: collectProcesses(),
      loadAvg: os.loadavg() as [number, number, number],
    }

    await this.repository.save(payload)
    return payload
  }
}
```

- [ ] **Step 2: Write collect-metrics.use-case.spec.ts**

```typescript
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from '../infra/in-memory-metric-repository'
import { CollectMetricsUseCase } from './collect-metrics.use-case'

describe('CollectMetricsUseCase', () => {
  let repository: InMemoryMetricRepository
  let useCase: CollectMetricsUseCase

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
    useCase = new CollectMetricsUseCase(repository, 'test-host', '6.1.0', '1d 00:00')
  })

  it('should collect and return a metric payload', async () => {
    const payload = await useCase.execute()

    expect(payload.type).toBe('metrics')
    expect(payload.hostname).toBe('test-host')
    expect(payload.kernel).toBe('6.1.0')
    expect(payload.uptime).toBe('1d 00:00')
    expect(payload.cpu).toBeDefined()
    expect(payload.ram).toBeDefined()
    expect(payload.disk).toBeDefined()
    expect(payload.network).toBeDefined()
    expect(payload.processes).toBeDefined()
    expect(payload.loadAvg).toHaveLength(3)
  })

  it('should persist metrics in the repository', async () => {
    await useCase.execute()

    const latest = await repository.findLatest()
    expect(latest?.hostname).toBe('test-host')
  })

  it('should produce unique timestamps', async () => {
    const first = await useCase.execute()
    const second = await useCase.execute()

    expect(second.timestamp).toBeGreaterThanOrEqual(first.timestamp)
  })
})
```

- [ ] **Step 3: Write get-metrics.use-case.ts**

```typescript
import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'

export class GetMetricsUseCase {
  constructor(private readonly repository: MetricRepository) {}

  async execute(): Promise<MetricPayload | null> {
    return this.repository.findLatest()
  }

  async executeHistory(limit: number): Promise<MetricPayload[]> {
    return this.repository.findHistory(limit)
  }
}
```

- [ ] **Step 4: Write get-metrics.use-case.spec.ts**

```typescript
import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryMetricRepository } from '../infra/in-memory-metric-repository'
import { GetMetricsUseCase } from './get-metrics.use-case'
import type { MetricPayload } from '@pulseos/shared'

function createPayload(overrides: Partial<MetricPayload> = {}): MetricPayload {
  return {
    type: 'metrics', timestamp: Date.now(), hostname: 'host', kernel: '6.1', uptime: '1d',
    cpu: { overall: 50, cores: [50], model: 'T', speed: 3000 },
    ram: { total: 8e9, used: 4e9, free: 4e9, cached: 1e9, percent: 50 },
    disk: { total: 100e9, used: 50e9, percent: 50, readSpeed: 1e6, writeSpeed: 5e5, device: '/dev/sda', mountpoint: '/' },
    network: { rx: 1e6, tx: 5e5, interface: 'eth0' },
    processes: [], loadAvg: [1, 1, 1],
    ...overrides,
  }
}

describe('GetMetricsUseCase', () => {
  let repository: InMemoryMetricRepository
  let useCase: GetMetricsUseCase

  beforeEach(() => {
    repository = new InMemoryMetricRepository()
    useCase = new GetMetricsUseCase(repository)
  })

  it('should return null when no metrics exist', async () => {
    expect(await useCase.execute()).toBeNull()
  })

  it('should return the latest metric', async () => {
    await repository.save(createPayload({ hostname: 'old' }))
    await repository.save(createPayload({ hostname: 'new' }))

    const result = await useCase.execute()
    expect(result?.hostname).toBe('new')
  })

  it('should return history up to limit', async () => {
    for (let i = 0; i < 10; i++) {
      await repository.save(createPayload({ timestamp: i }))
    }

    const history = await useCase.executeHistory(5)
    expect(history.length).toBe(5)
  })
})
```

- [ ] **Step 5: Write kill-process.use-case.ts**

```typescript
import { execSync } from 'child_process'
import { ProcessNotFoundError } from '../domain/domain-errors'

export class KillProcessUseCase {
  async execute(pid: number): Promise<{ pid: number; success: boolean }> {
    try {
      process.kill(pid, 'SIGTERM')
      return { pid, success: true }
    } catch {
      throw new ProcessNotFoundError(pid)
    }
  }
}
```

- [ ] **Step 6: Write kill-process.use-case.spec.ts**

```typescript
import { describe, expect, it } from 'vitest'
import { KillProcessUseCase } from './kill-process.use-case'
import { ProcessNotFoundError } from '../domain/domain-errors'

describe('KillProcessUseCase', () => {
  const useCase = new KillProcessUseCase()

  it('should throw ProcessNotFoundError for invalid pid', async () => {
    await expect(useCase.execute(99999999)).rejects.toThrow(ProcessNotFoundError)
  })

  it('should throw ProcessNotFoundError with correct code', async () => {
    try {
      await useCase.execute(99999999)
      expect.fail('should throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ProcessNotFoundError)
      expect((error as ProcessNotFoundError).code).toBe('PROCESS_NOT_FOUND')
    }
  })
})
```

- [ ] **Step 7: Run all agent tests**

Run: `npm run test --workspace=packages/agent -- --run`
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add packages/agent/src/modules/metrics/use-cases/
git commit -m "feat: add CollectMetrics, GetMetrics, KillProcess use cases with tests"
```

---

## Task 6: Agent Metric Collectors

**Files:**
- Create: `packages/agent/src/modules/metrics/infra/collectors/cpu.ts`
- Create: `packages/agent/src/modules/metrics/infra/collectors/ram.ts`
- Create: `packages/agent/src/modules/metrics/infra/collectors/disk.ts`
- Create: `packages/agent/src/modules/metrics/infra/collectors/network.ts`
- Create: `packages/agent/src/modules/metrics/infra/collectors/processes.ts`

- [ ] **Step 1: Write cpu.ts**

```typescript
import os from 'os'
import { execSync } from 'child_process'
import type { CpuMetrics } from '@pulseos/shared'

let prevCpuTimes: { idle: number; total: number }[] = []

export function collectCpu(): CpuMetrics {
  const cpus = os.cpus()
  const cores: number[] = []

  const currentTimes = cpus.map((cpu) => {
    const { user, nice, sys, idle, irq } = cpu.times
    return { idle, total: user + nice + sys + idle + irq }
  })

  if (prevCpuTimes.length === 0) {
    cores.fill(0, 0, currentTimes.length)
    for (let i = 0; i < currentTimes.length; i++) cores.push(0)
  } else {
    for (let i = 0; i < currentTimes.length; i++) {
      const prev = prevCpuTimes[i]
      const curr = currentTimes[i]
      const totalDiff = curr.total - prev.total
      const idleDiff = curr.idle - prev.idle
      cores.push(totalDiff === 0 ? 0 : Math.round(((totalDiff - idleDiff) / totalDiff) * 100))
    }
  }

  prevCpuTimes = currentTimes

  const overall = cores.length > 0 ? Math.round(cores.reduce((a, b) => a + b, 0) / cores.length) : 0

  let temp: number | undefined
  try {
    const thermal = execSync('cat /sys/class/thermal/thermal_zone0/temp 2>/dev/null', { encoding: 'utf-8' }).trim()
    temp = Math.round(parseInt(thermal, 10) / 1000)
  } catch {
    temp = undefined
  }

  return {
    overall,
    cores,
    temp,
    model: cpus[0]?.model || 'Unknown',
    speed: cpus[0]?.speed || 0,
  }
}
```

- [ ] **Step 2: Write ram.ts**

```typescript
import os from 'os'
import { readFileSync } from 'fs'
import type { RamMetrics } from '@pulseos/shared'

export function collectRam(): RamMetrics {
  const total = os.totalmem()
  const free = os.freemem()
  const used = total - free

  let cached = 0
  try {
    const meminfo = readFileSync('/proc/meminfo', 'utf-8')
    const cachedMatch = meminfo.match(/^Cached:\s+(\d+)/m)
    if (cachedMatch) cached = parseInt(cachedMatch[1], 10) * 1024
  } catch { cached = 0 }

  return { total, used, free, cached, percent: Math.round((used / total) * 100) }
}
```

- [ ] **Step 3: Write disk.ts**

```typescript
import { execSync } from 'child_process'
import type { DiskMetrics } from '@pulseos/shared'

let prevReadBytes = 0
let prevWriteBytes = 0
let prevTime = Date.now()

export function collectDisk(): DiskMetrics {
  let total = 0, used = 0, percent = 0, device = '/', mountpoint = '/'

  try {
    const dfOutput = execSync('df -B1 / | tail -1', { encoding: 'utf-8' }).trim()
    const parts = dfOutput.split(/\s+/)
    device = parts[0] || '/'
    total = parseInt(parts[1], 10) || 0
    used = parseInt(parts[2], 10) || 0
    percent = parseInt(parts[4], 10) || 0
    mountpoint = parts[5] || '/'
  } catch { /* fallback */ }

  let readSpeed = 0, writeSpeed = 0
  try {
    const stat = execSync("cat /proc/diskstats | grep 'sda \\|nvme0n1 '", { encoding: 'utf-8' })
    const lines = stat.trim().split('\n')
    if (lines.length > 0) {
      const parts = lines[0].trim().split(/\s+/)
      const readBytes = parseInt(parts[5], 10) * 512
      const writeBytes = parseInt(parts[9], 10) * 512
      const now = Date.now()
      const elapsed = (now - prevTime) / 1000
      if (elapsed > 0 && prevTime > 0) {
        readSpeed = Math.round((readBytes - prevReadBytes) / elapsed)
        writeSpeed = Math.round((writeBytes - prevWriteBytes) / elapsed)
      }
      prevReadBytes = readBytes
      prevWriteBytes = writeBytes
      prevTime = now
    }
  } catch { /* fallback */ }

  return { total, used, percent, readSpeed, writeSpeed, device, mountpoint }
}
```

- [ ] **Step 4: Write network.ts**

```typescript
import { readFileSync } from 'fs'
import type { NetworkMetrics } from '@pulseos/shared'

let prevRx = 0, prevTx = 0, prevTime = Date.now()

export function collectNetwork(): NetworkMetrics {
  let rx = 0, tx = 0, iface = 'eth0'

  try {
    const netdev = readFileSync('/proc/net/dev', 'utf-8')
    const lines = netdev.trim().split('\n').slice(2)
    for (const line of lines) {
      const [ifacePart, dataPart] = line.split(':')
      if (!ifacePart || !dataPart) continue
      const trimmedIface = ifacePart.trim()
      if (trimmedIface === 'lo') continue
      const stats = dataPart.trim().split(/\s+/).map(Number)
      rx += stats[0] || 0
      tx += stats[8] || 0
      iface = trimmedIface
    }
  } catch { /* fallback */ }

  const now = Date.now()
  const elapsed = (now - prevTime) / 1000
  let rxSpeed = 0, txSpeed = 0
  if (elapsed > 0 && prevTime > 0) {
    rxSpeed = Math.round((rx - prevRx) / elapsed)
    txSpeed = Math.round((tx - prevTx) / elapsed)
  }
  prevRx = rx
  prevTx = tx
  prevTime = now

  return { rx: rxSpeed, tx: txSpeed, interface: iface }
}
```

- [ ] **Step 5: Write processes.ts**

```typescript
import { execSync } from 'child_process'
import type { ProcessInfo } from '@pulseos/shared'

export function collectProcesses(): ProcessInfo[] {
  try {
    const output = execSync('ps aux --sort=-%cpu | head -11', { encoding: 'utf-8' })
    return output.trim().split('\n').slice(1).map((line) => {
      const parts = line.trim().split(/\s+/)
      return {
        pid: parseInt(parts[1], 10),
        user: parts[0],
        cpu: parseFloat(parts[2]),
        mem: parseFloat(parts[3]),
        name: parts[10] || parts[parts.length - 1],
      }
    })
  } catch {
    return []
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/agent/src/modules/metrics/infra/collectors/
git commit -m "feat: add CPU, RAM, disk, network, process metric collectors"
```

---

## Task 7: Agent Fastify Server + Routes + Swagger

**Files:**
- Create: `packages/agent/src/lib/errors.ts`
- Create: `packages/agent/src/routes/metrics.routes.ts`
- Create: `packages/agent/src/routes/ws.routes.ts`
- Create: `packages/agent/src/index.ts`

- [ ] **Step 1: Write errors.ts**

```typescript
import type { FastifyError } from 'fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '../modules/metrics/domain/domain-errors'

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof DomainError) {
    return reply.status(error.statusCode).send({
      error: error.code,
      message: error.message,
    })
  }

  return reply.status(500).send({
    error: 'INTERNAL_ERROR',
    message: error.message || 'Internal server error',
  })
}
```

- [ ] **Step 2: Write metrics.routes.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { KillProcessSchema } from '@pulseos/shared'
import { CollectMetricsUseCase } from '../modules/metrics/use-cases/collect-metrics.use-case'
import { GetMetricsUseCase } from '../modules/metrics/use-cases/get-metrics.use-case'
import { KillProcessUseCase } from '../modules/metrics/use-cases/kill-process.use-case'
import { InMemoryMetricRepository } from '../modules/metrics/infra/in-memory-metric-repository'

const repository = new InMemoryMetricRepository()
const collectUseCase = new CollectMetricsUseCase(
  repository,
  require('os').hostname(),
  require('os').release(),
  formatUptime(require('os').uptime()),
)
const getUseCase = new GetMetricsUseCase(repository)
const killUseCase = new KillProcessUseCase()

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

export async function metricsRoutes(app: FastifyInstance) {
  app.get('/api/metrics/current', {
    schema: {
      description: 'Get latest metric snapshot',
      tags: ['metrics'],
      response: { 200: { type: 'object' } },
    },
  }, async () => {
    return getUseCase.execute()
  })

  app.get('/api/metrics/history', {
    schema: {
      description: 'Get historical metrics',
      tags: ['metrics'],
      querystring: {
        type: 'object',
        properties: { limit: { type: 'integer', default: 50 } },
      },
    },
  }, async (request) => {
    const { limit } = request.query as { limit?: number }
    return getUseCase.executeHistory(limit ?? 50)
  })

  app.post('/api/processes/:pid/kill', {
    schema: {
      description: 'Kill a process by PID',
      tags: ['processes'],
      params: {
        type: 'object',
        properties: { pid: { type: 'integer' } },
        required: ['pid'],
      },
    },
  }, async (request, reply) => {
    const { pid } = request.params as { pid: string }
    const result = await killUseCase.execute(Number(pid))
    return reply.status(200).send(result)
  })

  app.get('/api/health', {
    schema: {
      description: 'Health check',
      tags: ['system'],
      response: { 200: { type: 'object', properties: { status: { type: 'string' } } } },
    },
  }, async () => {
    return { status: 'ok', timestamp: Date.now() }
  })

  app.get('/api/metrics/collect', {
    schema: {
      description: 'Manually trigger metric collection',
      tags: ['metrics'],
    },
  }, async () => {
    return collectUseCase.execute()
  })
}
```

- [ ] **Step 3: Write ws.routes.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import type { WebSocket } from 'ws'

const clients = new Set<WebSocket>()

export async function wsRoutes(app: FastifyInstance) {
  app.get('/ws', { websocket: true }, (socket: WebSocket) => {
    clients.add(socket)
    console.log(`WS client connected (${clients.size} total)`)

    socket.on('message', (data) => {
      const command = data.toString().trim()
      let response: unknown

      if (command === '--ping') {
        response = { type: 'pong', data: { timestamp: Date.now() } }
      } else if (command === '--status') {
        response = { type: 'status', data: { clients: clients.size, uptime: process.uptime() } }
      } else if (command.startsWith('kill:')) {
        const pid = parseInt(command.split(':')[1], 10)
        try {
          process.kill(pid, 'SIGTERM')
          response = { type: 'kill_result', data: { pid, success: true } }
        } catch (err) {
          response = { type: 'kill_result', data: { pid, success: false, error: String(err) } }
        }
      } else {
        response = { type: 'pong', data: { error: 'Unknown command' } }
      }

      socket.send(JSON.stringify(response))
    })

    socket.on('close', () => {
      clients.delete(socket)
      console.log(`WS client disconnected (${clients.size} total)`)
    })
  })
}

export function broadcastMetrics(payload: unknown) {
  const data = JSON.stringify(payload)
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(data)
    }
  }
}
```

- [ ] **Step 4: Write index.ts**

```typescript
import Fastify from 'fastify'
import cors from '@fastify/cors'
import { fastifyWebsocket } from '@fastify/websocket'
import { fastifySwagger } from '@fastify/swagger'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import { metricsRoutes } from './routes/metrics.routes'
import { wsRoutes, broadcastMetrics } from './routes/ws.routes'
import { errorHandler } from './lib/errors'
import { CollectMetricsUseCase } from './modules/metrics/use-cases/collect-metrics.use-case'
import { InMemoryMetricRepository } from './modules/metrics/infra/in-memory-metric-repository'
import os from 'os'

const COLLECTION_INTERVAL = 1000

async function main() {
  const app = Fastify({ logger: true })

  await app.register(cors, { origin: true })
  await app.register(fastifyWebsocket)
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'PulseOS.node API',
        version: '2.4.0',
        description: 'Linux Server Monitoring Agent API',
      },
    },
  })
  await app.register(fastifySwaggerUi, { routePrefix: '/docs' })

  app.setErrorHandler(errorHandler)

  await app.register(metricsRoutes)
  await app.register(wsRoutes)

  const hostname = os.hostname()
  const kernel = os.release()
  const uptimeSeconds = os.uptime()
  const days = Math.floor(uptimeSeconds / 86400)
  const hours = Math.floor((uptimeSeconds % 86400) / 3600)
  const minutes = Math.floor((uptimeSeconds % 3600) / 60)
  const uptime = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`

  const repository = new InMemoryMetricRepository()
  const collectUseCase = new CollectMetricsUseCase(repository, hostname, kernel, uptime)

  await app.listen({ port: 3001, host: '0.0.0.0' })

  console.log(`PulseOS.node agent running on http://localhost:3001`)
  console.log(`Swagger docs at http://localhost:3001/docs`)
  console.log(`WebSocket at ws://localhost:3001/ws`)

  setInterval(async () => {
    const payload = await collectUseCase.execute()
    broadcastMetrics(payload)
  }, COLLECTION_INTERVAL)
}

main()
```

- [ ] **Step 5: Commit**

```bash
git add packages/agent/src/index.ts packages/agent/src/routes/ packages/agent/src/lib/
git commit -m "feat: add Fastify server with REST routes, WebSocket, Swagger docs"
```

---

## Task 8: Dashboard Setup — Next.js + Tailwind + shadcn

**Files:**
- Create: `packages/dashboard/package.json`
- Create: `packages/dashboard/tsconfig.json`
- Create: `packages/dashboard/next.config.js`
- Create: `packages/dashboard/tailwind.config.ts`
- Create: `packages/dashboard/postcss.config.js`
- Create: `packages/dashboard/components.json`
- Create: `packages/dashboard/app/globals.css`
- Create: `packages/dashboard/lib/utils.ts`

- [ ] **Step 1: Create dashboard package.json**

```json
{
  "name": "@pulseos/dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@pulseos/shared": "*",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "recharts": "^2.12.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.344.0",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tooltip": "^1.0.7"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^14.2.0",
    "@testing-library/jest-dom": "^6.4.0",
    "@testing-library/user-event": "^14.5.0",
    "msw": "^2.2.0",
    "jsdom": "^24.0.0"
  }
}
```

- [ ] **Step 2: Create tailwind.config.ts**

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { primary: '#0a0a0f', card: '#12121a', elevated: '#1a1a2e' },
        accent: { DEFAULT: '#f0b429', hover: '#d9a020', muted: 'rgba(240, 180, 41, 0.15)' },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
        border: '#1e1e2e',
        text: { DEFAULT: '#e0e0e0', muted: '#6b7280', dim: '#4b5563' },
      },
      fontFamily: { mono: ['JetBrains Mono', 'Fira Code', 'monospace'] },
      borderRadius: { lg: '0.75rem', md: '0.5rem', sm: '0.25rem' },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

- [ ] **Step 3: Create components.json (shadcn config)**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "zinc",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 4: Create globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #0a0a0f;
    --bg-card: #12121a;
    --bg-elevated: #1a1a2e;
    --accent: #f0b429;
    --accent-hover: #d9a020;
    --accent-muted: rgba(240, 180, 41, 0.15);
    --text: #e0e0e0;
    --text-muted: #6b7280;
    --border: #1e1e2e;
    --success: #22c55e;
    --warning: #f59e0b;
    --danger: #ef4444;
    --radius: 0.75rem;
  }

  body {
    @apply bg-bg-primary text-text antialiased;
  }

  * {
    @apply border-border;
  }
}

@layer utilities {
  .scrollbar-thin {
    scrollbar-width: thin;
  }
}
```

- [ ] **Step 5: Create lib/utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/dashboard/
git commit -m "feat: scaffold Next.js dashboard with Tailwind and shadcn/ui config"
```

---

## Task 9: Install All Dependencies

- [ ] **Step 1: Install dependencies**

Run: `npm install`
Expected: All workspace dependencies installed

- [ ] **Step 2: Initialize shadcn components**

Run: `npx shadcn@latest add card badge button table input progress --cwd packages/dashboard`
Expected: shadcn components created in `packages/dashboard/components/ui/`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: install dependencies and add shadcn/ui components"
```

---

## Task 10: Dashboard Components — Header, StatusBadge, ServerInfoCard

**Files:**
- Create: `packages/dashboard/components/StatusBadge.tsx`
- Create: `packages/dashboard/components/StatusBadge.spec.tsx`
- Create: `packages/dashboard/components/Header.tsx`
- Create: `packages/dashboard/components/Header.spec.tsx`
- Create: `packages/dashboard/components/ServerInfoCard.tsx`
- Create: `packages/dashboard/components/MetricCard.tsx`
- Create: `packages/dashboard/components/GradientGauge.tsx`

- [ ] **Step 1: Write StatusBadge.tsx**

```tsx
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  label: string
  color: 'success' | 'warning' | 'danger' | 'accent'
  pulse?: boolean
}

const colorMap = {
  success: 'bg-success/15 text-success border-success/30',
  warning: 'bg-warning/15 text-warning border-warning/30',
  danger: 'bg-danger/15 text-danger border-danger/30',
  accent: 'bg-accent/15 text-accent border-accent/30',
}

export function StatusBadge({ label, color, pulse = false }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border uppercase tracking-wider',
      colorMap[color],
    )}>
      <span className={cn('w-2 h-2 rounded-full bg-current', pulse && 'animate-pulse')} />
      {label}
    </span>
  )
}
```

- [ ] **Step 2: Write StatusBadge.spec.tsx**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge'

describe('<StatusBadge />', () => {
  it('should render the label text', () => {
    render(<StatusBadge label="AGENT ONLINE" color="success" />)
    expect(screen.getByText('AGENT ONLINE')).toBeInTheDocument()
  })

  it('should apply pulse animation when pulse prop is true', () => {
    render(<StatusBadge label="STREAMING" color="accent" pulse />)
    const dot = screen.getByText('STREAMING').querySelector('.animate-pulse')
    expect(dot).toBeInTheDocument()
  })

  it('should not have pulse animation by default', () => {
    render(<StatusBadge label="IDLE" color="warning" />)
    const dot = screen.getByText('IDLE').querySelector('.animate-pulse')
    expect(dot).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 3: Write Header.tsx**

```tsx
import { StatusBadge } from './StatusBadge'

interface HeaderProps {
  wsConnected: boolean
}

export function Header({ wsConnected }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-mono font-bold text-sm">&gt;_</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text">
              Pulse<span className="text-accent">OS</span>.node
            </h1>
            <p className="text-xs text-text-muted">Linux Monitoring Agent &amp; WebSocket Telemetry Stream</p>
          </div>
        </div>
        <StatusBadge label="V2.4.0" color="accent" />
      </div>
      <nav className="flex items-center gap-2">
        <button className="px-4 py-2 rounded-lg bg-accent/15 text-accent text-sm font-medium border border-accent/30 hover:bg-accent/25 transition-colors">
          Dashboard
        </button>
        <button className="px-4 py-2 rounded-lg text-text-muted text-sm font-medium hover:bg-bg-elevated transition-colors">
          UI Component Library
        </button>
      </nav>
      <StatusBadge
        label={wsConnected ? 'WS Stream: Active' : 'WS Stream: Disconnected'}
        color={wsConnected ? 'success' : 'danger'}
        pulse={wsConnected}
      />
    </header>
  )
}
```

- [ ] **Step 4: Write Header.spec.tsx**

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Header } from './Header'

describe('<Header />', () => {
  it('should render the agent name', () => {
    render(<Header wsConnected={false} />)
    expect(screen.getByText('Pulse')).toBeInTheDocument()
    expect(screen.getByText('OS')).toBeInTheDocument()
    expect(screen.getByText('.node')).toBeInTheDocument()
  })

  it('should show active WS status when connected', () => {
    render(<Header wsConnected={true} />)
    expect(screen.getByText('WS Stream: Active')).toBeInTheDocument()
  })

  it('should show disconnected WS status when not connected', () => {
    render(<Header wsConnected={false} />)
    expect(screen.getByText('WS Stream: Disconnected')).toBeInTheDocument()
  })

  it('should render navigation buttons', () => {
    render(<Header wsConnected={false} />)
    expect(screen.getByRole('button', { name: /Dashboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /UI Component Library/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Write ServerInfoCard.tsx**

```tsx
import type { MetricPayload } from '@pulseos/shared'

interface ServerInfoCardProps {
  data: MetricPayload | null
  wsRate: number
}

export function ServerInfoCard({ data, wsRate }: ServerInfoCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
          <span className="text-accent font-mono">&gt;_</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-text font-mono">{data?.hostname || '---'}</h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-success/15 text-success border border-success/30">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online
            </span>
          </div>
          <p className="text-xs text-text-muted">{data?.kernel || '---'}</p>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Uptime</p>
          <p className="text-sm font-mono text-text">{data?.uptime || '---'}</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Node Agent</p>
          <p className="text-sm font-mono text-accent">~24 ms (Tick)</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">WebSocket Rate</p>
          <p className="text-sm font-mono text-text">{wsRate} msgs/sec</p>
        </div>
        <div className="bg-bg-elevated rounded-lg p-3">
          <p className="text-xs text-text-muted mb-1">Load Average</p>
          <p className="text-sm font-mono text-text">
            {data?.loadAvg ? `${data.loadAvg[0].toFixed(2)}, ${data.loadAvg[1].toFixed(2)}, ${data.loadAvg[2].toFixed(2)}` : '---'}
          </p>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Write GradientGauge.tsx**

```tsx
import { cn } from '@/lib/utils'

interface GradientGaugeProps {
  value: number
  max?: number
  height?: string
}

export function GradientGauge({ value, max = 100, height = 'h-2' }: GradientGaugeProps) {
  const percent = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className={cn('w-full rounded-full bg-bg-elevated overflow-hidden', height)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #f0b429 0%, #d9a020 100%)' }}
      />
    </div>
  )
}
```

- [ ] **Step 7: Write MetricCard.tsx**

```tsx
import { GradientGauge } from './GradientGauge'

interface MetricCardProps {
  title: string
  icon: string
  value: string | number
  subtitle?: string
  percent: number
  details?: { label: string; value: string | number }[]
}

export function MetricCard({ title, icon, value, subtitle, percent, details = [] }: MetricCardProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5 hover:border-accent/30 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h3 className="text-sm font-medium text-text">{title}</h3>
            {subtitle && <p className="text-xs text-text-muted">{subtitle}</p>}
          </div>
        </div>
        <span className="text-2xl font-bold text-accent font-mono">{value}</span>
      </div>
      <GradientGauge value={percent} height="h-1.5" />
      {details.length > 0 && (
        <div className="flex justify-between mt-3">
          {details.map((d) => (
            <span key={d.label} className="text-xs text-text-muted">
              {d.label}: <span className="text-text font-mono">{d.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 8: Run component tests**

Run: `npm run test --workspace=packages/dashboard -- --run`
Expected: All component tests PASS

- [ ] **Step 9: Commit**

```bash
git add packages/dashboard/components/
git commit -m "feat: add Header, StatusBadge, ServerInfoCard, MetricCard, GradientGauge components with tests"
```

---

## Task 11: Dashboard Components — Chart, CoreCluster, ProcessTable, WSEventStream

**Files:**
- Create: `packages/dashboard/components/RealTimeChart.tsx`
- Create: `packages/dashboard/components/CoreCluster.tsx`
- Create: `packages/dashboard/components/ProcessTable.tsx`
- Create: `packages/dashboard/components/ProcessTable.spec.tsx`
- Create: `packages/dashboard/components/WSEventStream.tsx`

- [ ] **Step 1: Write RealTimeChart.tsx**

```tsx
'use client'
import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ChartDataPoint { time: string; cpu: number; ram: number }
interface RealTimeChartProps { data: ChartDataPoint[] }

export function RealTimeChart({ data }: RealTimeChartProps) {
  const formattedData = useMemo(() =>
    data.map((point, i) => ({ ...point, label: `${Math.round((data.length - i) * 0.1)}s ago` })),
    [data],
  )

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-medium text-text">Real-time System Load Stream</h3>
          <span className="text-xs text-text-muted">Live WebSocket telemetry buffer (100ms sample rate)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <span className="text-xs text-text-muted">CPU %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-xs text-text-muted">RAM %</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f0b429" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f0b429" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={{ stroke: '#1e1e2e' }} axisLine={{ stroke: '#1e1e2e' }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={{ stroke: '#1e1e2e' }} axisLine={{ stroke: '#1e1e2e' }} />
            <Tooltip contentStyle={{ backgroundColor: '#12121a', border: '1px solid #1e1e2e', borderRadius: '8px', color: '#e0e0e0' }} />
            <Area type="monotone" dataKey="cpu" stroke="#f0b429" strokeWidth={2} fill="url(#cpuGradient)" dot={false} isAnimationActive={false} />
            <Area type="monotone" dataKey="ram" stroke="#f59e0b" strokeWidth={2} fill="url(#ramGradient)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write CoreCluster.tsx**

```tsx
import { GradientGauge } from './GradientGauge'

interface CoreClusterProps { cores: number[]; governor?: string; architecture?: string }

export function CoreCluster({ cores, governor = 'performance', architecture = 'x86_64' }: CoreClusterProps) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <h3 className="text-sm font-medium text-text">CPU Core Cluster</h3>
        </div>
        <span className="text-xs text-text-muted">{cores.length} Cores Active</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cores.map((usage, i) => (
          <div key={i} className="bg-bg-elevated rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-text-muted">CORE {i}</span>
              <span className="text-xs font-mono text-accent">{usage}%</span>
            </div>
            <GradientGauge value={usage} height="h-1.5" />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-text-muted">Gov: <span className="text-text font-mono">{governor}</span></span>
        <span className="text-xs text-text-muted">Architecture: <span className="text-text font-mono">{architecture}</span></span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Write ProcessTable.tsx**

```tsx
'use client'
import { useState } from 'react'
import type { ProcessInfo } from '@pulseos/shared'

interface ProcessTableProps { processes: ProcessInfo[]; onKill: (pid: number) => void }

export function ProcessTable({ processes, onKill }: ProcessTableProps) {
  const [confirmKill, setConfirmKill] = useState<number | null>(null)

  const handleKill = (pid: number) => {
    if (confirmKill === pid) {
      onKill(pid)
      setConfirmKill(null)
    } else {
      setConfirmKill(pid)
      setTimeout(() => setConfirmKill(null), 3000)
    }
  }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🌳</span>
          <h3 className="text-sm font-medium text-text">Active Process Tree</h3>
          <span className="text-xs text-text-muted">Top resource consumers updated via Node agent</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">PID</th>
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">PROCESS</th>
              <th className="text-left py-2 px-3 text-xs text-text-muted font-medium">USER</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">CPU %</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">MEM %</th>
              <th className="text-right py-2 px-3 text-xs text-text-muted font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {processes.map((proc) => (
              <tr key={proc.pid} className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors">
                <td className="py-2 px-3 font-mono text-text">{proc.pid}</td>
                <td className="py-2 px-3 font-mono text-text">{proc.name}</td>
                <td className="py-2 px-3 text-text-muted">{proc.user}</td>
                <td className="py-2 px-3 text-right font-mono text-text">{proc.cpu.toFixed(1)}%</td>
                <td className="py-2 px-3 text-right font-mono text-text">{proc.mem.toFixed(1)}%</td>
                <td className="py-2 px-3 text-right">
                  <button
                    onClick={() => handleKill(proc.pid)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      confirmKill === proc.pid
                        ? 'bg-danger/20 text-danger border border-danger/40'
                        : 'bg-bg-elevated text-text-muted hover:text-danger hover:bg-danger/10 border border-border'
                    }`}
                  >
                    {confirmKill === proc.pid ? 'Confirm?' : '✕'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write ProcessTable.spec.tsx**

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProcessTable } from './ProcessTable'
import type { ProcessInfo } from '@pulseos/shared'

const mockProcesses: ProcessInfo[] = [
  { pid: 1420, name: 'node /agent/server.js', user: 'root', cpu: 18.4, mem: 4.2 },
  { pid: 2189, name: 'next-server (v14.2)', user: 'www-data', cpu: 12.1, mem: 14.8 },
]

describe('<ProcessTable />', () => {
  it('should render process list', () => {
    render(<ProcessTable processes={mockProcesses} onKill={vi.fn()} />)
    expect(screen.getByText('node /agent/server.js')).toBeInTheDocument()
    expect(screen.getByText('next-server (v14.2)')).toBeInTheDocument()
  })

  it('should display PID and user for each process', () => {
    render(<ProcessTable processes={mockProcesses} onKill={vi.fn()} />)
    expect(screen.getByText('1420')).toBeInTheDocument()
    expect(screen.getByText('root')).toBeInTheDocument()
  })

  it('should call onKill with pid on double click confirm', async () => {
    const user = userEvent.setup()
    const onKill = vi.fn()
    render(<ProcessTable processes={mockProcesses} onKill={onKill} />)

    const killButton = screen.getAllByText('✕')[0]
    await user.click(killButton)
    expect(screen.getByText('Confirm?')).toBeInTheDocument()

    await user.click(screen.getByText('Confirm?'))
    expect(onKill).toHaveBeenCalledWith(1420)
  })
})
```

- [ ] **Step 5: Write WSEventStream.tsx**

```tsx
'use client'
import { useState, useRef, useEffect } from 'react'

interface WSEvent { timestamp: string; direction: 'rx' | 'tx'; data: string }
interface WSEventStreamProps { events: WSEvent[]; onSend: (command: string) => void }

export function WSEventStream({ events, onSend }: WSEventStreamProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [events])

  const handleSend = () => { if (input.trim()) { onSend(input.trim()); setInput('') } }

  return (
    <div className="bg-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <h3 className="text-sm font-medium text-text">WebSocket Event Stream</h3>
        </div>
      </div>
      <div ref={scrollRef} className="h-48 overflow-y-auto bg-bg-primary rounded-lg p-3 font-mono text-xs space-y-1">
        {events.map((event, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-text-dim">[{event.timestamp}]</span>
            <span className={event.direction === 'rx' ? 'text-success' : 'text-accent'}>[WS FRAME] {event.direction}:</span>
            <span className="text-text-muted truncate">{event.data}</span>
          </div>
        ))}
        {events.length === 0 && <div className="text-text-dim">Waiting for WebSocket frames...</div>}
      </div>
      <div className="flex gap-2 mt-3">
        <input
          type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Send debug command (e.g., --ping)..."
          className="flex-1 bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-dim font-mono focus:outline-none focus:border-accent/50"
        />
        <button onClick={handleSend} className="px-4 py-2 bg-accent text-bg-primary rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors">
          Send
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add packages/dashboard/components/
git commit -m "feat: add RealTimeChart, CoreCluster, ProcessTable, WSEventStream components"
```

---

## Task 12: Dashboard — useWebSocket Hook + Tests

**Files:**
- Create: `packages/dashboard/hooks/useWebSocket.ts`
- Create: `packages/dashboard/hooks/useWebSocket.spec.ts`

- [ ] **Step 1: Write useWebSocket.ts**

```typescript
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type { MetricPayload } from '@pulseos/shared'

interface UseWebSocketReturn {
  data: MetricPayload | null
  connected: boolean
  wsRate: number
  events: { timestamp: string; direction: 'rx' | 'tx'; data: string }[]
  send: (command: string) => void
}

export function useWebSocket(url: string): UseWebSocketReturn {
  const [data, setData] = useState<MetricPayload | null>(null)
  const [connected, setConnected] = useState(false)
  const [wsRate, setWsRate] = useState(0)
  const [events, setEvents] = useState<{ timestamp: string; direction: 'rx' | 'tx'; data: string }[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const messageCount = useRef(0)
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null)

  const getTimestamp = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  }

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(url)
      ws.onopen = () => setConnected(true)
      ws.onmessage = (event) => {
        setEvents((prev) => [...prev.slice(-99), { timestamp: getTimestamp(), direction: 'rx', data: event.data.substring(0, 120) }])
        try {
          const parsed = JSON.parse(event.data)
          if (parsed.type === 'metrics') setData(parsed as MetricPayload)
          messageCount.current++
        } catch { /* non-JSON */ }
      }
      ws.onclose = () => { setConnected(false); reconnectTimeout.current = setTimeout(connect, 3000) }
      ws.onerror = () => ws.close()
      wsRef.current = ws
    } catch {
      reconnectTimeout.current = setTimeout(connect, 3000)
    }
  }, [url])

  useEffect(() => {
    connect()
    return () => { wsRef.current?.close(); if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current) }
  }, [connect])

  useEffect(() => {
    const interval = setInterval(() => { setWsRate(messageCount.current); messageCount.current = 0 }, 1000)
    return () => clearInterval(interval)
  }, [])

  const send = useCallback((command: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(command)
      setEvents((prev) => [...prev.slice(-99), { timestamp: getTimestamp(), direction: 'tx', data: command }])
    }
  }, [])

  return { data, connected, wsRate, events, send }
}
```

- [ ] **Step 2: Write useWebSocket.spec.ts**

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useWebSocket } from './useWebSocket'

const mockWs = {
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
  onopen: null as (() => void) | null,
  onmessage: null as ((event: { data: string }) => void) | null,
  onclose: null as (() => void) | null,
  onerror: null as (() => void) | null,
}

vi.stubGlobal('WebSocket', vi.fn(() => mockWs))

describe('<useWebSocket>', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(WebSocket).mockReturnValue(mockWs as unknown as WebSocket)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should start with disconnected state', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))
    expect(result.current.connected).toBe(false)
    expect(result.current.data).toBeNull()
  })

  it('should connect and set connected to true', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))

    act(() => mockWs.onopen?.())

    expect(result.current.connected).toBe(true)
  })

  it('should update data on metric message', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:3001'))

    act(() => mockWs.onopen?.())
    act(() => {
      mockWs.onmessage?.({
        data: JSON.stringify({ type: 'metrics', hostname: 'test', cpu: { overall: 50 } }),
      })
    })

    expect(result.current.data?.hostname).toBe('test')
  })
})
```

- [ ] **Step 3: Run tests**

Run: `npm run test --workspace=packages/dashboard -- --run`
Expected: All tests PASS

- [ ] **Step 4: Commit**

```bash
git add packages/dashboard/hooks/
git commit -m "feat: add useWebSocket hook with unit tests"
```

---

## Task 13: Dashboard — Main Page + Layout

**Files:**
- Create: `packages/dashboard/app/layout.tsx`
- Create: `packages/dashboard/app/page.tsx`

- [ ] **Step 1: Write layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PulseOS.node — Linux Monitoring Agent',
  description: 'Real-time Linux server monitoring dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Write page.tsx**

```tsx
'use client'
import { useMemo } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { Header } from '@/components/Header'
import { ServerInfoCard } from '@/components/ServerInfoCard'
import { MetricCard } from '@/components/MetricCard'
import { RealTimeChart } from '@/components/RealTimeChart'
import { CoreCluster } from '@/components/CoreCluster'
import { ProcessTable } from '@/components/ProcessTable'
import { WSEventStream } from '@/components/WSEventStream'

const WS_URL = 'ws://localhost:3001/ws'

export default function Dashboard() {
  const { data, connected, wsRate, events, send } = useWebSocket(WS_URL)

  const chartData = useMemo(() =>
    Array.from({ length: 200 }, (_, i) => ({ time: `${200 - i}`, cpu: 0, ram: 0 })),
    [],
  )

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header wsConnected={connected} />
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <ServerInfoCard data={data} wsRate={wsRate} />
        <div className="grid grid-cols-2 gap-6">
          <MetricCard title="CPU Load" icon="🔲" value={`${data?.cpu.overall || 0}%`}
            subtitle={`${data?.cpu.cores.length || 0} Cores @ ${data?.cpu.speed || 0}GHz`}
            percent={data?.cpu.overall || 0}
            details={[{ label: 'Core Temp', value: data?.cpu.temp ? `${data.cpu.temp}°C` : 'N/A' }, { label: 'Processes', value: data?.processes.length || 0 }]} />
          <MetricCard title="RAM Usage" icon="🔲" value={`${data?.ram.percent || 0}%`}
            subtitle={`${((data?.ram.total || 0) / (1024 ** 3)).toFixed(0)} GB`}
            percent={data?.ram.percent || 0}
            details={[{ label: 'Used', value: `${((data?.ram.used || 0) / (1024 ** 3)).toFixed(1)} GB` }, { label: 'Cache', value: `${((data?.ram.cached || 0) / (1024 ** 3)).toFixed(1)} GB` }]} />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <MetricCard title="Disk Storage" icon="🔲" value={`${data?.disk.percent || 0}%`}
            subtitle={`${data?.disk.device || '/'} ${data?.disk.mountpoint || '/'}`}
            percent={data?.disk.percent || 0}
            details={[{ label: 'I/O Read', value: `${((data?.disk.readSpeed || 0) / (1024 ** 2)).toFixed(1)} MB/s` }, { label: 'Write', value: `${((data?.disk.writeSpeed || 0) / (1024 ** 2)).toFixed(1)} MB/s` }]} />
          <MetricCard title="Network Interface" icon="🔲" value={`${((data?.network.rx || 0) / (1024 ** 2)).toFixed(1)} Gbps`}
            subtitle={data?.network.interface || 'eth0'}
            percent={Math.min(((data?.network.rx || 0) / (1024 ** 3)) * 100, 100)}
            details={[{ label: 'RX', value: `${((data?.network.rx || 0) / (1024 ** 2)).toFixed(0)} MB/s` }, { label: 'TX', value: `${((data?.network.tx || 0) / (1024 ** 2)).toFixed(0)} MB/s` }]} />
        </div>
        <RealTimeChart data={chartData} />
        <CoreCluster cores={data?.cpu.cores || []} />
        <ProcessTable processes={data?.processes || []} onKill={(pid) => send(`kill:${pid}`)} />
        <WSEventStream events={events} onSend={send} />
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add packages/dashboard/app/
git commit -m "feat: add dashboard main page with all components assembled"
```

---

## Task 14: E2E Tests — Playwright

**Files:**
- Create: `packages/e2e/package.json`
- Create: `packages/e2e/playwright.config.ts`
- Create: `packages/e2e/tests/dashboard.spec.ts`
- Create: `packages/e2e/tests/metrics-api.spec.ts`

- [ ] **Step 1: Create e2e package.json**

```json
{
  "name": "@pulseos/e2e",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@playwright/test": "^1.42.0"
  }
}
```

- [ ] **Step 2: Create playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  forbidOnly: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  webServer: [
    { command: 'npm run dev:agent', port: 3001, reuseExistingServer: true },
    { command: 'npm run dev:dashboard', port: 3000, reuseExistingServer: true },
  ],
})
```

- [ ] **Step 3: Write dashboard.spec.ts**

```typescript
import { expect, test } from '@playwright/test'

test('dashboard loads and shows agent name', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Pulse')).toBeVisible()
  await expect(page.getByText('OS')).toBeVisible()
  await expect(page.getByText('.node')).toBeVisible()
})

test('dashboard shows metric cards', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('CPU Load')).toBeVisible()
  await expect(page.getByText('RAM Usage')).toBeVisible()
  await expect(page.getByText('Disk Storage')).toBeVisible()
  await expect(page.getByText('Network Interface')).toBeVisible()
})

test('dashboard shows process table', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Active Process Tree')).toBeVisible()
})

test('dashboard shows WebSocket event stream', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('WebSocket Event Stream')).toBeVisible()
})

test('dashboard shows real-time chart', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Real-time System Load Stream')).toBeVisible()
})
```

- [ ] **Step 4: Write metrics-api.spec.ts**

```typescript
import { expect, test } from '@playwright/test'

test('GET /api/health returns ok', async ({ request }) => {
  const response = await request.get('http://localhost:3001/api/health')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.status).toBe('ok')
})

test('GET /api/metrics/current returns metrics', async ({ request }) => {
  const response = await request.get('http://localhost:3001/api/metrics/current')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(body.type).toBe('metrics')
  expect(body.hostname).toBeDefined()
})

test('GET /api/metrics/history returns array', async ({ request }) => {
  const response = await request.get('http://localhost:3001/api/metrics/history?limit=10')
  expect(response.ok()).toBeTruthy()
  const body = await response.json()
  expect(Array.isArray(body)).toBeTruthy()
})

test('POST /api/processes/:pid/kill returns result', async ({ request }) => {
  const response = await request.post('http://localhost:3001/api/processes/99999999/kill')
  const body = await response.json()
  expect(body.success).toBe(false)
})
```

- [ ] **Step 5: Commit**

```bash
git add packages/e2e/
git commit -m "feat: add Playwright E2E tests for dashboard and API"
```

---

## Task 15: Vitest Workspace Config

**Files:**
- Create: `vitest.workspace.ts`

- [ ] **Step 1: Write vitest.workspace.ts**

```typescript
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    test: {
      name: 'agent',
      root: './packages/agent',
      include: ['src/**/*.spec.ts'],
      environment: 'node',
    },
  },
  {
    test: {
      name: 'dashboard',
      root: './packages/dashboard',
      include: ['**/*.spec.{ts,tsx}'],
      environment: 'jsdom',
      setupFiles: [],
    },
  },
])
```

- [ ] **Step 2: Commit**

```bash
git add vitest.workspace.ts
git commit -m "chore: add Vitest workspace config for agent and dashboard"
```

---

## Task 16: Install Dependencies & Verify Build

- [ ] **Step 1: Install all dependencies**

Run: `npm install`
Expected: All workspace dependencies installed

- [ ] **Step 2: Run all unit tests**

Run: `npm run test`
Expected: All unit tests PASS

- [ ] **Step 3: Typecheck agent**

Run: `npm run typecheck --workspace=packages/agent`
Expected: PASS

- [ ] **Step 4: Typecheck dashboard**

Run: `npm run typecheck --workspace=packages/dashboard`
Expected: PASS

- [ ] **Step 5: Lint with BiomeJS**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 6: Build dashboard**

Run: `npm run build --workspace=packages/dashboard`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: verify build, tests, lint, and typecheck pass"
```

---

## Task 17: Integration Smoke Test

- [ ] **Step 1: Start agent**

Run: `npm run dev:agent`
Expected: Fastify starts on http://localhost:3001, Swagger at /docs, WebSocket at /ws

- [ ] **Step 2: Start dashboard**

Run: `npm run dev:dashboard`
Expected: Next.js starts on http://localhost:3000

- [ ] **Step 3: Open browser and verify**

- Dashboard loads with cyberpunk theme
- Header shows "PulseOS.node" with WS status
- ServerInfoCard shows hostname, kernel, uptime, load average
- MetricCards show CPU/RAM/Disk/Network with updating percentages
- RealTimeChart shows streaming area chart
- CoreCluster shows per-core usage bars
- ProcessTable lists top processes with kill buttons
- WSEventStream shows incoming WebSocket frames

- [ ] **Step 4: Test Swagger docs**

- Navigate to http://localhost:3001/docs
- Swagger UI loads with API endpoints listed

- [ ] **Step 5: Test WebSocket commands**

- Type `--ping` in WSEventStream, click Send
- Terminal shows tx/rx frames

- [ ] **Step 6: Run E2E tests**

Run: `npm run test:e2e --workspace=packages/e2e`
Expected: All E2E tests PASS

- [ ] **Step 7: Final commit**

```bash
git add -A
git commit -m "feat: complete PulseOS.node monitoring dashboard with full test suite"
```
