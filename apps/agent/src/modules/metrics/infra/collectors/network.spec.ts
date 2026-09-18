import { describe, expect, it } from 'vitest'
import { collectNetwork } from './network'

describe('collectNetwork', () => {
  it('should return network metrics with correct shape', () => {
    const metrics = collectNetwork()

    expect(metrics).toHaveProperty('rx')
    expect(metrics).toHaveProperty('tx')
    expect(metrics).toHaveProperty('interface')
  })

  it('should return non-negative rx/tx', () => {
    const metrics = collectNetwork()

    expect(metrics.rx).toBeGreaterThanOrEqual(0)
    expect(metrics.tx).toBeGreaterThanOrEqual(0)
  })

  it('should return non-empty interface name', () => {
    const metrics = collectNetwork()

    expect(metrics.interface.length).toBeGreaterThan(0)
  })

  it('should calculate speed between calls', () => {
    // First call initializes baseline
    const first = collectNetwork()
    expect(first.rx).toBeGreaterThanOrEqual(0)

    // Second call should show actual speed
    const second = collectNetwork()
    expect(second.rx).toBeGreaterThanOrEqual(0)
    expect(second.tx).toBeGreaterThanOrEqual(0)
  })
})
