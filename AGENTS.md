# AGENTS.md

## Project

PulseOS.node — real-time Linux server monitoring dashboard. Fastify API agent collects CPU/RAM/disk/network/processes, streams via WebSocket to Next.js dashboard with cyberpunk theme.

## Architecture

Monorepo with pnpm workspaces. Hexagonal architecture (ports & adapters) in the agent.

```
apps/
  agent/        # Fastify 5 API + WebSocket + metric collectors
  dashboard/    # Next.js 14 + shadcn/ui + Recharts
packages/
  shared/       # TypeScript types + Zod schemas (zero runtime deps)
```

Agent module layout (`apps/agent/src/modules/metrics/`):
- `domain/` — entities, repository contract, DomainError
- `use-cases/` — business logic (classes with `execute()`)
- `infra/` — in-memory repo (tests), Drizzle repo (prod), collectors

## Commands

```bash
# Dev
pnpm dev:agent          # Fastify on :3001 (tsx watch)
pnpm dev:dashboard      # Next.js on :3000

# Verify
pnpm lint               # BiomeJS check
pnpm lint:fix           # BiomeJS auto-fix
pnpm typecheck          # tsc --noEmit for agent + dashboard
pnpm test               # Vitest run (all workspaces)

# E2E
pnpm test:e2e:agent     # Playwright — apps/agent
pnpm test:e2e:dashboard # Playwright — apps/dashboard
```

Single package test: `pnpm --filter @pulseos/agent test`
Single file test: `pnpm vitest run apps/agent/src/path/to/file.spec.ts`

## Lefthook Hooks

- **pre-commit**: `biome check --staged` (auto-fix enabled)
- **pre-push**: `typecheck` + `test`

## Code Style (BiomeJS v2)

- Single quotes, no semicolons
- 2-space indent, 100 char line width
- `noExplicitAny: off`, `noNonNullAssertion: off`
- `noUnusedImports: warn`, `noUnusedVariables: warn`

## Testing Conventions

- Unit tests co-located: `*.spec.ts` next to source
- Use in-memory repos as test doubles (no `vi.mock` for repositories)
- `beforeEach` for fresh instances
- Test factories for entity creation
- Component tests: React Testing Library + `@testing-library/user-event`
- E2E: Playwright in `apps/*/tests/e2e/`

## Key Dependencies

- Fastify 5 (not 4) — required by `@fastify/type-provider-zod@1.0.0`
- Zod 4.x (used by `@fastify/type-provider-zod@1.0.0`)
- BiomeJS 2.5+ (config schema changed from v1)

## Gotchas

- Workspace config uses `pnpm-workspace.yaml` (not `workspaces` in package.json)
- Agent is ESM (`"type": "module"`) — use `import` not `require`
- Agent collectors read `/proc/` and run `ps`/`df` — Linux only
