import { describe, expect, it } from 'vitest'
import { collectRam } from './ram'

describe('collectRam', () => {
  it('should return RAM metrics with correct shape', () => {
    const metrics = collectRam()

    expect(metrics).toHaveProperty('total')
    expect(metrics).toHaveProperty('used')
    expect(metrics).toHaveProperty('free')
    expect(metrics).toHaveProperty('cached')
    expect(metrics).toHaveProperty('percent')
  })

  it('should return positive total memory', () => {
    const metrics = collectRam()

    expect(metrics.total).toBeGreaterThan(0)
  })

  it('should return used memory less than or equal to total', () => {
    const metrics = collectRam()

    expect(metrics.used).toBeLessThanOrEqual(metrics.total)
  })

  it('should return valid percentage', () => {
    const metrics = collectRam()

    expect(metrics.percent).toBeGreaterThanOrEqual(0)
    expect(metrics.percent).toBeLessThanOrEqual(100)
  })

  it('should return free memory', () => {
    const metrics = collectRam()

    expect(metrics.free).toBeGreaterThanOrEqual(0)
  })

  it('should return cached memory', () => {
    const metrics = collectRam()

    expect(metrics.cached).toBeGreaterThanOrEqual(0)
  })
})
