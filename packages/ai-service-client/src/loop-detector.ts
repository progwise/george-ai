export class LoopDetector {
  private chunkHistory: string[] = []
  private repetitionCounts: Map<string, number> = new Map()
  private readonly threshold: number

  constructor(maxAllowedRepetitions?: number) {
    this.threshold = maxAllowedRepetitions ?? Infinity
  }

  detectLoop(chunk: string): { isLoop: boolean; repetitiveChunk?: string } {
    // Skip empty chunks
    if (!chunk || chunk.trim().length === 0) {
      return { isLoop: false }
    }

    // 1. Exact string repetition detection
    const exactCount = this.repetitionCounts.get(chunk) || 0
    this.repetitionCounts.set(chunk, exactCount + 1)

    if (exactCount + 1 >= this.threshold) {
      return { isLoop: true, repetitiveChunk: chunk }
    }

    // 2. Fuzzy/pattern matching for similar content
    // TODO: Implement similarity algorithms (e.g., Levenshtein distance)
    // to detect near-duplicates - can be added in future iterations
    
    // Store chunk in history for potential future fuzzy matching
    this.chunkHistory.push(chunk)
    
    // Keep history manageable (last 50 chunks)
    if (this.chunkHistory.length > 50) {
      this.chunkHistory.shift()
    }

    return { isLoop: false }
  }

  getCount(chunk: string): number {
    return this.repetitionCounts.get(chunk) || 0
  }

  reset(): void {
    this.chunkHistory = []
    this.repetitionCounts.clear()
  }
}