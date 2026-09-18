import { z } from 'zod'

export const CpuMetricsSchema = z.object({
  overall: z.number().min(0).max(100),
  cores: z.array(z.number()),
  temp: z.number().optional(),
  model: z.string(),
  speed: z.number(),
})

export const RamMetricsSchema = z.object({
  total: z.number(),
  used: z.number(),
  free: z.number(),
  cached: z.number(),
  percent: z.number().min(0).max(100),
})

export const DiskMetricsSchema = z.object({
  total: z.number(),
  used: z.number(),
  percent: z.number().min(0).max(100),
  readSpeed: z.number(),
  writeSpeed: z.number(),
  device: z.string(),
  mountpoint: z.string(),
})

export const NetworkMetricsSchema = z.object({
  rx: z.number(),
  tx: z.number(),
  interface: z.string(),
})

export const ProcessInfoSchema = z.object({
  pid: z.number(),
  name: z.string(),
  user: z.string(),
  cpu: z.number(),
  mem: z.number(),
})

export const MetricPayloadSchema = z.object({
  type: z.literal('metrics'),
  timestamp: z.number(),
  hostname: z.string(),
  kernel: z.string(),
  uptime: z.string(),
  cpu: CpuMetricsSchema,
  ram: RamMetricsSchema,
  disk: DiskMetricsSchema,
  network: NetworkMetricsSchema,
  processes: z.array(ProcessInfoSchema),
  loadAvg: z.tuple([z.number(), z.number(), z.number()]),
})

export const KillProcessSchema = z.object({
  pid: z.number().int().positive(),
})

export const MetricsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).default(50),
})
