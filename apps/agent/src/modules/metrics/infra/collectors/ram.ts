import fs from 'node:fs'
import os from 'node:os'
import type { RamMetrics } from '@pulseos/shared'

function readMemInfo(): Map<string, number> {
  const content = fs.readFileSync('/proc/meminfo', 'utf-8')
  const map = new Map<string, number>()
  for (const line of content.split('\n')) {
    const match = line.match(/^(\w+):\s+(\d+)/)
    if (match) {
      map.set(match[1], Number.parseInt(match[2], 10) * 1024) // kB to bytes
    }
  }
  return map
}

export function collectRam(): RamMetrics {
  const memInfo = readMemInfo()
  const total = os.totalmem()
  const free = memInfo.get('MemFree') ?? 0
  const cached = memInfo.get('Cached') ?? 0
  const buffers = memInfo.get('Buffers') ?? 0
  const available = memInfo.get('MemAvailable') ?? free + cached + buffers
  const used = total - available
  const percent = total > 0 ? Math.round((used / total) * 100 * 100) / 100 : 0

  return {
    total,
    used,
    free,
    cached,
    percent,
  }
}
