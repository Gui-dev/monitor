import { describe, expect, it } from 'vitest'
import { collectCpu } from './cpu'

describe('collectCpu', () => {
  it('should return CPU metrics with correct shape', () => {
    const metrics = collectCpu()

    expect(metrics).toHaveProperty('overall')
    expect(metrics).toHaveProperty('cores')
    expect(metrics).toHaveProperty('model')
    expect(metrics).toHaveProperty('speed')
    expect(typeof metrics.overall).toBe('number')
    expect(Array.isArray(metrics.cores)).toBe(true)
    expect(typeof metrics.model).toBe('string')
    expect(typeof metrics.speed).toBe('number')
  })

  it('should return valid CPU usage percentage', () => {
    const metrics = collectCpu()

    expect(metrics.overall).toBeGreaterThanOrEqual(0)
    expect(metrics.overall).toBeLessThanOrEqual(100)
  })

  it('should return core count matching os.cpus().length', () => {
    const metrics = collectCpu()
    const os = require('node:os')

    expect(metrics.cores.length).toBe(os.cpus().length)
  })

  it('should have temp as number or undefined', () => {
    const metrics = collectCpu()

    if (metrics.temp !== undefined) {
      expect(typeof metrics.temp).toBe('number')
      expect(metrics.temp).toBeGreaterThan(0)
      expect(metrics.temp).toBeLessThan(200)
    }
  })

  it('should return non-empty model string', () => {
    const metrics = collectCpu()

    expect(metrics.model.length).toBeGreaterThan(0)
  })

  it('should return positive speed', () => {
    const metrics = collectCpu()

    expect(metrics.speed).toBeGreaterThan(0)
  })
})
