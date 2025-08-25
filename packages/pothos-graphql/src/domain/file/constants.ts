/**
 * Configuration constants for AI Library Crawlers
 */

// File size limits (in bytes)
export const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB maximum file size for processing
export const WARN_FILE_SIZE = 50 * 1024 * 1024 // 50MB warning threshold

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Check if file size is within acceptable limits
 */
export function isFileSizeAcceptable(fileSize: number): {
  acceptable: boolean
  reason?: string
  shouldWarn?: boolean
} {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      acceptable: false,
      reason: `File size ${formatFileSize(fileSize)} exceeds maximum limit of ${formatFileSize(MAX_FILE_SIZE)}`,
    }
  }

  if (fileSize > WARN_FILE_SIZE) {
    return {
      acceptable: true,
      shouldWarn: true,
      reason: `Large file size ${formatFileSize(fileSize)} detected (above ${formatFileSize(WARN_FILE_SIZE)} threshold)`,
    }
  }

  return { acceptable: true }
}
