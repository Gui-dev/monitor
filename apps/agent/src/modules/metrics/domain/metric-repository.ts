import type { MetricPayload } from '@pulseos/shared'

export interface MetricRepository {
  save(payload: MetricPayload): Promise<void>
  findLatest(): Promise<MetricPayload | null>
  findHistory(limit: number): Promise<MetricPayload[]>
}
