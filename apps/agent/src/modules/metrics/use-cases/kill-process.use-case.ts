import { execSync } from 'node:child_process'
import { ProcessNotFoundError } from '../domain/domain-errors'

export interface KillProcessResult {
  pid: number
  signal: string
  success: boolean
}

export class KillProcessUseCase {
  async execute(pid: number): Promise<KillProcessResult> {
    if (pid <= 0) {
      throw new ProcessNotFoundError(pid)
    }

    try {
      execSync(`kill -9 ${pid}`, { stdio: 'pipe' })
      return { pid, signal: 'SIGKILL', success: true }
    } catch {
      throw new ProcessNotFoundError(pid)
    }
  }
}
