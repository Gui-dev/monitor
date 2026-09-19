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
