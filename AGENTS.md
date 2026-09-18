# AGENTS.md

## Project

PulseOS.node — real-time Linux server monitoring dashboard. Fastify API agent collects CPU/RAM/disk/network/processes, streams via WebSocket to Next.js dashboard with cyberpunk theme.

## Architecture

Monorepo with npm workspaces. Hexagonal architecture (ports & adapters) in the agent.

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
npm run dev:agent          # Fastify on :3001 (tsx watch)
npm run dev:dashboard      # Next.js on :3000

# Verify
npm run lint               # BiomeJS check
npm run lint:fix           # BiomeJS auto-fix
npm run typecheck          # tsc --noEmit for agent + dashboard
npm run test               # Vitest run (all workspaces)

# E2E
npm run test:e2e:agent     # Playwright — apps/agent
npm run test:e2e:dashboard # Playwright — apps/dashboard
```

Single package test: `npm run test --workspace=apps/agent`
Single file test: `npx vitest run apps/agent/src/path/to/file.spec.ts`

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
- `.npmrc` has `legacy-peer-deps=true` — peer dep conflicts are expected

## Gotchas

- `npm install` requires `--legacy-peer-deps` (handled by `.npmrc`)
- Agent is ESM (`"type": "module"`) — use `import` not `require`
- Dashboard tsconfig doesn't exist yet (Task 15) — pre-commit lint only for now
- Agent collectors read `/proc/` and run `ps`/`df` — Linux only
