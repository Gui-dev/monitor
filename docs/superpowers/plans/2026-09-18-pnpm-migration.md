# pnpm Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the PulseOS.node monorepo from npm workspaces to pnpm.

**Architecture:** Replace npm workspace tooling with pnpm equivalents. Add `pnpm-workspace.yaml`, update `.npmrc`, replace `npm run` / `npx` references in root scripts and lefthook hooks, then clean-install and verify.

**Tech Stack:** pnpm, lefthook, BiomeJS, TypeScript, Vitest

---

### Task 1: Create pnpm-workspace.yaml

**Files:**
- Create: `pnpm-workspace.yaml`

- [ ] **Step 1: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

- [ ] **Step 2: Verify file exists**

Run: `cat pnpm-workspace.yaml`
Expected: the YAML content above.

---

### Task 2: Replace .npmrc

**Files:**
- Modify: `.npmrc`

- [ ] **Step 1: Overwrite .npmrc**

Replace entire contents with:

```ini
# pnpm settings
auto-install-peers=true
strict-peer-dependencies=false
```

- [ ] **Step 2: Verify file**

Run: `cat .npmrc`
Expected: two pnpm settings lines.

---

### Task 3: Update root package.json scripts

**Files:**
- Modify: `package.json` (root)

- [ ] **Step 1: Update scripts block**

Replace the `scripts` object with:

```json
{
  "prepare": "lefthook install",
  "dev:agent": "pnpm --filter @pulseos/agent dev",
  "dev:dashboard": "pnpm --filter @pulseos/dashboard dev",
  "build": "pnpm -r build",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e:agent": "playwright test --config apps/agent/playwright.config.ts",
  "test:e2e:dashboard": "playwright test --config apps/dashboard/playwright.config.ts",
  "lint": "biome check .",
  "lint:fix": "biome check --write .",
  "format": "biome format --write .",
  "typecheck": "tsc --noEmit -p apps/agent/tsconfig.json && tsc --noEmit -p apps/dashboard/tsconfig.json"
}
```

Keep `workspaces`, `devDependencies`, and `dependencies` unchanged.

- [ ] **Step 2: Verify file**

Run: `cat package.json`
Expected: scripts use `pnpm` and `biome` (not `npx @biomejs/biome`).

---

### Task 4: Update lefthook.yml

**Files:**
- Modify: `lefthook.yml`

- [ ] **Step 1: Update pre-push commands**

Change lines 12-14 from:
```yaml
    typecheck:
      run: npm run typecheck
    test:
      run: npm run test
```
to:
```yaml
    typecheck:
      run: pnpm run typecheck
    test:
      run: pnpm run test
```

- [ ] **Step 2: Verify file**

Run: `cat lefthook.yml`
Expected: `pnpm run` in pre-push commands.

---

### Task 5: Clean install with pnpm

**Files:**
- Delete: `package-lock.json`
- Delete: `node_modules/`

- [ ] **Step 1: Remove npm artifacts**

```bash
rm -f package-lock.json
rm -rf node_modules
```

- [ ] **Step 2: Install with pnpm**

```bash
pnpm install
```

Expected: lockfile created, all dependencies installed.

- [ ] **Step 3: Verify workspace links**

Run: `ls -la node_modules/@pulseos/`
Expected: symlinks to `apps/agent`, `apps/dashboard`, `packages/shared`.

---

### Task 6: Verify per-workspace typecheck

- [ ] **Step 1: Check shared**

```bash
pnpm --filter @pulseos/shared typecheck
```

Expected: no errors.

- [ ] **Step 2: Check agent**

```bash
pnpm --filter @pulseos/agent typecheck
```

Expected: no errors.

---

### Task 7: Run tests

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: all 71 tests pass.

---

### Task 8: Run full typecheck and lint

- [ ] **Step 1: Typecheck**

```bash
pnpm run typecheck
```

Expected: no errors.

- [ ] **Step 2: Lint**

```bash
pnpm run lint
```

Expected: no errors or only warnings.

---

### Task 9: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add -A
git commit -m "chore: migrate from npm to pnpm"
```

---

## Self-Review

1. **Spec coverage:** All 10 steps from the user spec are mapped to tasks above.
2. **Placeholder scan:** All steps have exact file paths, exact content, and exact commands.
3. **Type consistency:** Package names (`@pulseos/agent`, `@pulseos/dashboard`, `@pulseos/shared`) match across all files.
