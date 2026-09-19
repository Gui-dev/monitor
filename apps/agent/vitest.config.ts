import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['**/*.spec.ts'],
    exclude: ['**/tests/e2e/**', '**/node_modules/**'],
  },
})
