export class DomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 400,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class ProcessNotFoundError extends DomainError {
  constructor(pid: number) {
    super('PROCESS_NOT_FOUND', `Process ${pid} not found`, 404)
  }
}

export class MetricCollectionError extends DomainError {
  constructor(metric: string, cause?: string) {
    super('METRIC_COLLECTION_ERROR', `Failed to collect ${metric}${cause ? `: ${cause}` : ''}`, 500)
  }
}
