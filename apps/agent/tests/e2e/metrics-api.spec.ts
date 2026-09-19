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
