import { execSync } from 'node:child_process'
import fs from 'node:fs'
import type { DiskMetrics } from '@pulseos/shared'

interface DiskStats {
  device: string
  mountpoint: string
  total: number
  used: number
  percent: number
}

function getDiskUsage(): DiskStats[] {
  try {
    const output = execSync(
      'df -B1 --output=source,target,size,used,pcent -x tmpfs -x devtmpfs -x squashfs 2>/dev/null',
      {
        encoding: 'utf-8',
      },
    )

    const lines = output.trim().split('\n').slice(1)
    return lines
      .filter((line) => line.startsWith('/dev/'))
      .map((line) => {
        const parts = line.trim().split(/\s+/)
        return {
          device: parts[0],
          mountpoint: parts[1],
          total: Number.parseInt(parts[2], 10),
          used: Number.parseInt(parts[3], 10),
          percent: Number.parseFloat(parts[4]),
        }
      })
  } catch {
    return []
  }
}

function getDiskIO(): { readSpeed: number; writeSpeed: number } {
  try {
    const statPath = '/proc/diskstats'
    if (!fs.existsSync(statPath)) return { readSpeed: 0, writeSpeed: 0 }

    const content = fs.readFileSync(statPath, 'utf-8')
    const lines = content.trim().split('\n')

    let totalRead = 0
    let totalWrite = 0

    for (const line of lines) {
      const parts = line.trim().split(/\s+/)
      if (parts.length < 14) continue

      const device = parts[2]
      // Skip partitions (only whole disks like sda, nvme0n1)
      if (device.includes('nvme') && !device.endsWith('nvme0n1')) continue
      if (/^\d+$/.test(device)) continue

      totalRead += Number.parseInt(parts[5], 10) * 512 // sectors to bytes
      totalWrite += Number.parseInt(parts[9], 10) * 512
    }

    return { readSpeed: totalRead, writeSpeed: totalWrite }
  } catch {
    return { readSpeed: 0, writeSpeed: 0 }
  }
}

export function collectDisk(): DiskMetrics {
  const disks = getDiskUsage()
  const primary = disks[0] ?? {
    device: '/dev/unknown',
    mountpoint: '/',
    total: 0,
    used: 0,
    percent: 0,
  }

  const { readSpeed, writeSpeed } = getDiskIO()

  return {
    total: primary.total,
    used: primary.used,
    percent: primary.percent,
    readSpeed,
    writeSpeed,
    device: primary.device,
    mountpoint: primary.mountpoint,
  }
}
