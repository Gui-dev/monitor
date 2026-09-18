import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'

export class GetMetricsUseCase {
  constructor(private readonly repository: MetricRepository) {}

  async getLatest(): Promise<MetricPayload | null> {
    return this.repository.findLatest()
  }

  async getHistory(limit: number): Promise<MetricPayload[]> {
    return this.repository.findHistory(limit)
  }
}
