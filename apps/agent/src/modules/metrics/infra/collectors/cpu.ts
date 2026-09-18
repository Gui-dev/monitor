import fs from 'node:fs'
import os from 'node:os'
import type { CpuMetrics } from '@pulseos/shared'

const CPU_TIMES = '/proc/stat'

function readCpuTimes(): {
  user: number
  nice: number
  system: number
  idle: number
  iowait: number
  irq: number
  softirq: number
} {
  const content = fs.readFileSync(CPU_TIMES, 'utf-8')
  const line = content.split('\n')[0]
  const parts = line.trim().split(/\s+/).slice(1).map(Number)
  return {
    user: parts[0],
    nice: parts[1],
    system: parts[2],
    idle: parts[3],
    iowait: parts[4],
    irq: parts[5],
    softirq: parts[6],
  }
}

function calculateCpuUsage(
  prev: ReturnType<typeof readCpuTimes>,
  curr: ReturnType<typeof readCpuTimes>,
): number {
  const prevTotal =
    prev.user + prev.nice + prev.system + prev.idle + prev.iowait + prev.irq + prev.softirq
  const currTotal =
    curr.user + curr.nice + curr.system + curr.idle + curr.iowait + curr.irq + curr.softirq
  const totalDiff = currTotal - prevTotal
  const idleDiff = curr.idle - prev.idle

  if (totalDiff === 0) return 0
  return Math.round(((totalDiff - idleDiff) / totalDiff) * 100 * 100) / 100
}

let prevCpuTimes = readCpuTimes()

function calculateCoreUsage(): number[] {
  const content = fs.readFileSync(CPU_TIMES, 'utf-8')
  const lines = content.split('\n').filter((line) => line.startsWith('cpu'))
  const prevCoreTimes: {
    user: number
    nice: number
    system: number
    idle: number
    iowait: number
    irq: number
    softirq: number
  }[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].trim().split(/\s+/).slice(1).map(Number)
    prevCoreTimes.push({
      user: parts[0],
      nice: parts[1],
      system: parts[2],
      idle: parts[3],
      iowait: parts[4],
      irq: parts[5],
      softirq: parts[6],
    })
  }

  // Re-read to get current times
  const currentContent = fs.readFileSync(CPU_TIMES, 'utf-8')
  const currentLines = currentContent.split('\n').filter((line) => line.startsWith('cpu'))
  const currCoreTimes: {
    user: number
    nice: number
    system: number
    idle: number
    iowait: number
    irq: number
    softirq: number
  }[] = []

  for (let i = 1; i < currentLines.length; i++) {
    const parts = currentLines[i].trim().split(/\s+/).slice(1).map(Number)
    currCoreTimes.push({
      user: parts[0],
      nice: parts[1],
      system: parts[2],
      idle: parts[3],
      iowait: parts[4],
      irq: parts[5],
      softirq: parts[6],
    })
  }

  return currCoreTimes.map((curr, i) => {
    const prev = prevCoreTimes[i]
    if (!prev) return 0
    return calculateCpuUsage(prev, curr)
  })
}

export function collectCpu(): CpuMetrics {
  const currentTimes = readCpuTimes()
  const overall = calculateCpuUsage(prevCpuTimes, currentTimes)
  prevCpuTimes = currentTimes

  const cores = calculateCoreUsage()
  const cpus = os.cpus()
  const temp = getCpuTemp()

  return {
    overall,
    cores,
    temp,
    model: cpus[0]?.model ?? 'Unknown',
    speed: cpus[0]?.speed ?? 0,
  }
}

function getCpuTemp(): number | undefined {
  try {
    const thermalPath = '/sys/class/thermal/thermal_zone0/temp'
    if (fs.existsSync(thermalPath)) {
      const temp = Number.parseInt(fs.readFileSync(thermalPath, 'utf-8').trim(), 10)
      return temp / 1000
    }
  } catch {
    // Temperature not available
  }
  return undefined
}
