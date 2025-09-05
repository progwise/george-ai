import type { MemoryUsage, OllamaInstance, OllamaSystemStatus } from './ollama-api-types.js'

export class MemoryCalculator {
  private safetyBufferGB: number

  constructor(safetyBufferGB: number = 2) {
    this.safetyBufferGB = safetyBufferGB * 1024 * 1024 * 1024 // Convert GB to bytes
  }

  calculateMemoryUsage(systemStatus: OllamaSystemStatus, instance: OllamaInstance): MemoryUsage {
    const usedVRAM = systemStatus.models.reduce((sum, model) => sum + (model.size_vram || model.size), 0)
    const totalVRAM = (instance.vramGB || 16) * 1024 * 1024 * 1024 // Convert GB to bytes
    const availableVRAM = totalVRAM - usedVRAM
    const safeVRAM = Math.max(0, availableVRAM - this.safetyBufferGB)

    // Estimate memory per request (context + processing overhead)
    // Conservative estimate: 1GB per concurrent vision request
    const estimatedRequestMemory = 1024 * 1024 * 1024 // 1GB

    const maxConcurrency = Math.max(1, Math.floor(safeVRAM / estimatedRequestMemory))

    return {
      totalVRAM,
      usedVRAM,
      availableVRAM,
      safeVRAM,
      estimatedRequestMemory,
      maxConcurrency,
    }
  }

  calculateLoadScore(memoryUsage: MemoryUsage): number {
    const memoryUtilization = memoryUsage.usedVRAM / memoryUsage.totalVRAM
    const availabilityScore = memoryUsage.maxConcurrency
    // Lower score = better (less load, more availability)
    return memoryUtilization * 100 - availabilityScore
  }
}
