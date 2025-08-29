export interface ConverterResult {
  markdownContent: string
  processingTimeMs: number
  notes?: string
  metadata?: Record<string, unknown>
  timeout: boolean
  partialResult: boolean
}
