// services/ai-service-worker/src/semaphore.ts

export class LocalSemaphore {
  private permits: Map<string, number> = new Map()
  private waitQueue: Map<string, Array<() => void>> = new Map()

  constructor(private maxPermits: Map<string, number>) {}

  async acquire(resourceId: string): Promise<() => void> {
    const available = this.permits.get(resourceId) ?? this.maxPermits.get(resourceId) ?? 1

    if (available > 0) {
      this.permits.set(resourceId, available - 1)
      return () => this.release(resourceId)
    }

    // Wait for permit
    return new Promise((resolve) => {
      const queue = this.waitQueue.get(resourceId) ?? []
      queue.push(() => resolve(() => this.release(resourceId)))
      this.waitQueue.set(resourceId, queue)
    })
  }

  private release(resourceId: string): void {
    const queue = this.waitQueue.get(resourceId)
    if (queue && queue.length > 0) {
      const next = queue.shift()!
      next()
    } else {
      const current = this.permits.get(resourceId) ?? 0
      const max = this.maxPermits.get(resourceId) ?? 1
      this.permits.set(resourceId, Math.min(current + 1, max))
    }
  }
}
