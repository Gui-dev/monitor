import { execSync } from 'node:child_process'
import type { ProcessInfo } from '@pulseos/shared'

export function collectProcesses(): ProcessInfo[] {
  try {
    const output = execSync('ps -eo pid,user,%cpu,%mem,comm --sort=-%cpu --no-headers | head -10', {
      encoding: 'utf-8',
      timeout: 5000,
    })

    return output
      .trim()
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => {
        const parts = line.trim().split(/\s+/)
        return {
          pid: Number.parseInt(parts[0], 10),
          user: parts[1],
          cpu: Number.parseFloat(parts[2]),
          mem: Number.parseFloat(parts[3]),
          name: parts.slice(4).join(' '),
        }
      })
  } catch {
    return []
  }
}
