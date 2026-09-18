import fs from 'node:fs'
import os from 'node:os'
import type { NetworkMetrics } from '@pulseos/shared'

interface NetDev {
  rxBytes: number
  txBytes: number
  name: string
}

function parseNetDev(): NetDev[] {
  const content = fs.readFileSync('/proc/net/dev', 'utf-8')
  const lines = content.trim().split('\n').slice(2)
  const devices: NetDev[] = []

  for (const line of lines) {
    const [iface, ...rest] = line.split(':')
    if (!iface) continue

    const name = iface.trim()
    // Skip loopback and virtual interfaces
    if (
      name === 'lo' ||
      name.startsWith('veth') ||
      name.startsWith('docker') ||
      name.startsWith('br-')
    ) {
      continue
    }

    const parts = rest.join(':').trim().split(/\s+/).map(Number)
    devices.push({
      name,
      rxBytes: parts[0] ?? 0,
      txBytes: parts[8] ?? 0,
    })
  }

  return devices
}

function getDefaultInterface(): string {
  try {
    const route = fs.readFileSync('/proc/net/route', 'utf-8')
    const lines = route.trim().split('\n').slice(1)
    for (const line of lines) {
      const parts = line.split(/\s+/)
      if (parts[1] === '00000000') {
        return parts[0]
      }
    }
  } catch {
    // fallback
  }
  const interfaces = os.networkInterfaces()
  const names = Object.keys(interfaces).filter((name) => name !== 'lo')
  return names[0] ?? 'unknown'
}

let prevRx = 0
let prevTx = 0
let prevTime = Date.now()

export function collectNetwork(): NetworkMetrics {
  const devices = parseNetDev()
  const targetInterface = getDefaultInterface()
  const device = devices.find((d) => d.name === targetInterface) ?? devices[0]

  if (!device) {
    return {
      rx: 0,
      tx: 0,
      interface: targetInterface,
    }
  }

  const now = Date.now()
  const elapsed = (now - prevTime) / 1000
  const rxSpeed = elapsed > 0 ? (device.rxBytes - prevRx) / elapsed : 0
  const txSpeed = elapsed > 0 ? (device.txBytes - prevTx) / elapsed : 0

  prevRx = device.rxBytes
  prevTx = device.txBytes
  prevTime = now

  return {
    rx: Math.round(rxSpeed * 100) / 100,
    tx: Math.round(txSpeed * 100) / 100,
    interface: device.name,
  }
}
