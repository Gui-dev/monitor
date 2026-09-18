import os from 'node:os'

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
}

function main() {
  const hostname = os.hostname()
  const kernel = os.release()
  const uptime = formatUptime(os.uptime())

  console.log('PulseOS.node agent starting...')
  console.log(`Host: ${hostname}`)
  console.log(`Kernel: ${kernel}`)
  console.log(`Uptime: ${uptime}`)
}

main()
