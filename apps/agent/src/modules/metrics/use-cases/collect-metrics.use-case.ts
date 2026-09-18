import os from 'node:os'
import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'
import { collectCpu } from '../infra/collectors/cpu'
import { collectDisk } from '../infra/collectors/disk'
import { collectNetwork } from '../infra/collectors/network'
import { collectProcesses } from '../infra/collectors/processes'
import { collectRam } from '../infra/collectors/ram'

export class CollectMetricsUseCase {
  constructor(
    private readonly repository: MetricRepository,
    private readonly hostname: string,
    private readonly kernel: string,
    private readonly uptime: string,
  ) {}

  async execute(): Promise<MetricPayload> {
    const payload: MetricPayload = {
      type: 'metrics',
      timestamp: Date.now(),
      hostname: this.hostname,
      kernel: this.kernel,
      uptime: this.uptime,
      cpu: collectCpu(),
      ram: collectRam(),
      disk: collectDisk(),
      network: collectNetwork(),
      processes: collectProcesses(),
      loadAvg: os.loadavg() as [number, number, number],
    }

    await this.repository.save(payload)
    return payload
  }
}
