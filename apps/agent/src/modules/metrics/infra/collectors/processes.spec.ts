import { describe, expect, it } from 'vitest'
import { collectProcesses } from './processes'

describe('collectProcesses', () => {
  it('should return an array of processes', () => {
    const processes = collectProcesses()

    expect(Array.isArray(processes)).toBe(true)
  })

  it('should return processes with correct shape', () => {
    const processes = collectProcesses()

    if (processes.length > 0) {
      const process = processes[0]
      expect(typeof process.pid).toBe('number')
      expect(typeof process.user).toBe('string')
      expect(typeof process.cpu).toBe('number')
      expect(typeof process.mem).toBe('number')
      expect(typeof process.name).toBe('string')
    }
  })

  it('should return at least one process', () => {
    const processes = collectProcesses()

    expect(processes.length).toBeGreaterThan(0)
  })

  it('should return processes sorted by CPU usage', () => {
    const processes = collectProcesses()

    if (processes.length > 1) {
      expect(processes[0].cpu).toBeGreaterThanOrEqual(processes[1].cpu)
    }
  })

  it('should limit to 10 processes', () => {
    const processes = collectProcesses()

    expect(processes.length).toBeLessThanOrEqual(10)
  })

  it('should have positive PIDs', () => {
    const processes = collectProcesses()

    for (const process of processes) {
      expect(process.pid).toBeGreaterThan(0)
    }
  })
})
