// PDF layout detection thresholds
export const PDF_LAYOUT = {
  VERTICAL_LINE_THRESHOLD: 2, // Group items within 2 units vertically
  SMALL_GAP_THRESHOLD: 5, // Small spacing between words
  LARGE_GAP_THRESHOLD: 20, // Large spacing (likely column separator)
  MIN_FONT_SIZE: 6, // Minimum font size to consider
  MAX_FONT_SIZE: 72, // Maximum reasonable font size
} as const

// Supported MIME types
export const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/xml',
  'application/javascript',
  'text/html',
] as const

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number]
