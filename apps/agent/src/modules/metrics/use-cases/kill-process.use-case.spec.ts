import { spawn } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { ProcessNotFoundError } from '../domain/domain-errors'
import { KillProcessUseCase } from './kill-process.use-case'

describe('KillProcessUseCase', () => {
  const useCase = new KillProcessUseCase()

  describe('execute', () => {
    it('should reject invalid PIDs', async () => {
      await expect(useCase.execute(0)).rejects.toThrow(ProcessNotFoundError)
      await expect(useCase.execute(-1)).rejects.toThrow(ProcessNotFoundError)
    })

    it('should throw ProcessNotFoundError for non-existent process', async () => {
      await expect(useCase.execute(999999999)).rejects.toThrow(ProcessNotFoundError)
    })

    it('should kill a real process', async () => {
      const child = spawn('sleep', ['30'])
      const pid = child.pid!

      const result = await useCase.execute(pid)

      expect(result.pid).toBe(pid)
      expect(result.signal).toBe('SIGKILL')
      expect(result.success).toBe(true)
    })
  })
})
