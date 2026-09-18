import type { MetricPayload } from '@pulseos/shared'
import type { MetricRepository } from '../domain/metric-repository'

export class InMemoryMetricRepository implements MetricRepository {
  private metrics: MetricPayload[] = []
  private maxHistory = 200

  async save(payload: MetricPayload): Promise<void> {
    this.metrics.push(payload)
    if (this.metrics.length > this.maxHistory) {
      this.metrics.shift()
    }
  }

  async findLatest(): Promise<MetricPayload | null> {
    return this.metrics[this.metrics.length - 1] ?? null
  }

  async findHistory(limit: number): Promise<MetricPayload[]> {
    return this.metrics.slice(-limit)
  }
}
