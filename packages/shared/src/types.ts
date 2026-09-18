export interface CpuMetrics {
  overall: number
  cores: number[]
  temp?: number
  model: string
  speed: number
}

export interface RamMetrics {
  total: number
  used: number
  free: number
  cached: number
  percent: number
}

export interface DiskMetrics {
  total: number
  used: number
  percent: number
  readSpeed: number
  writeSpeed: number
  device: string
  mountpoint: string
}

export interface NetworkMetrics {
  rx: number
  tx: number
  interface: string
}

export interface ProcessInfo {
  pid: number
  name: string
  user: string
  cpu: number
  mem: number
}

export interface MetricPayload {
  type: 'metrics'
  timestamp: number
  hostname: string
  kernel: string
  uptime: string
  cpu: CpuMetrics
  ram: RamMetrics
  disk: DiskMetrics
  network: NetworkMetrics
  processes: ProcessInfo[]
  loadAvg: [number, number, number]
}

export interface WSResponse {
  type: 'pong' | 'status' | 'kill_result'
  data: unknown
}

export type WSCommand = '--ping' | '--status' | `kill:${number}`
