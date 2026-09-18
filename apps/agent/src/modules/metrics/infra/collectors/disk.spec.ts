import { describe, expect, it } from 'vitest'
import { collectDisk } from './disk'

describe('collectDisk', () => {
  it('should return disk metrics with correct shape', () => {
    const metrics = collectDisk()

    expect(metrics).toHaveProperty('total')
    expect(metrics).toHaveProperty('used')
    expect(metrics).toHaveProperty('percent')
    expect(metrics).toHaveProperty('readSpeed')
    expect(metrics).toHaveProperty('writeSpeed')
    expect(metrics).toHaveProperty('device')
    expect(metrics).toHaveProperty('mountpoint')
  })

  it('should return positive total disk space', () => {
    const metrics = collectDisk()

    expect(metrics.total).toBeGreaterThan(0)
  })

  it('should return used space less than or equal to total', () => {
    const metrics = collectDisk()

    expect(metrics.used).toBeLessThanOrEqual(metrics.total)
  })

  it('should return valid percentage', () => {
    const metrics = collectDisk()

    expect(metrics.percent).toBeGreaterThanOrEqual(0)
    expect(metrics.percent).toBeLessThanOrEqual(100)
  })

  it('should return non-empty device name', () => {
    const metrics = collectDisk()

    expect(metrics.device.length).toBeGreaterThan(0)
  })

  it('should return non-empty mountpoint', () => {
    const metrics = collectDisk()

    expect(metrics.mountpoint.length).toBeGreaterThan(0)
  })

  it('should return non-negative IO speeds', () => {
    const metrics = collectDisk()

    expect(metrics.readSpeed).toBeGreaterThanOrEqual(0)
    expect(metrics.writeSpeed).toBeGreaterThanOrEqual(0)
  })
})
