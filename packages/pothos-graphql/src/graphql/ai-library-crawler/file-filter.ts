/**
 * File filtering utilities for AI Library Crawlers
 * Supports regex patterns, file size limits, and MIME type filtering
 */
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

export interface FileFilterConfig {
  includePatterns?: string[] // Regex patterns to include (if empty, include all)
  excludePatterns?: string[] // Regex patterns to exclude
  maxFileSize?: number // Maximum file size in MB
  minFileSize?: number // Minimum file size in MB
  allowedMimeTypes?: string[] // Allowed MIME types (if empty, allow all)
}

export interface FilterResult {
  allowed: boolean
  reason?: string
  filterType?: string
  filterValue?: string
}

export interface FileInfo {
  fileName: string
  filePath: string
  fileSize?: number
  modificationDate?: Date
}

/**
 * Apply file filters to determine if a file should be processed
 */
export function applyFileFilters(fileInfo: FileInfo, config: FileFilterConfig): FilterResult {
  const { fileName, filePath, fileSize } = fileInfo

  // Check include patterns first (if specified)
  if (config.includePatterns && config.includePatterns.length > 0) {
    let included = false
    for (const pattern of config.includePatterns) {
      try {
        const regex = new RegExp(pattern, 'i')
        if (regex.test(filePath) || regex.test(fileName)) {
          included = true
          break
        }
      } catch (error) {
        console.warn(`Invalid include pattern "${pattern}":`, error)
        // Skip invalid regex patterns
      }
    }

    if (!included) {
      // Find the first valid pattern for reporting
      const firstValidPattern = config.includePatterns.find((pattern) => {
        try {
          new RegExp(pattern, 'i')
          return true
        } catch {
          return false
        }
      })
      return {
        allowed: false,
        reason: `File "${fileName}" does not match any include patterns`,
        filterType: 'include_pattern',
        filterValue: firstValidPattern || config.includePatterns[0],
      }
    }
  }

  // Check exclude patterns
  if (config.excludePatterns && config.excludePatterns.length > 0) {
    for (const pattern of config.excludePatterns) {
      try {
        const regex = new RegExp(pattern, 'i')
        if (regex.test(filePath) || regex.test(fileName)) {
          return {
            allowed: false,
            reason: `File "${fileName}" matches exclude pattern: ${pattern}`,
            filterType: 'exclude_pattern',
            filterValue: pattern,
          }
        }
      } catch (error) {
        console.warn(`Invalid exclude pattern "${pattern}":`, error)
        // Skip invalid regex patterns
      }
    }
  }

  // Check file size limits (convert MB to bytes for comparison)
  if (fileSize !== undefined) {
    const maxFileSizeBytes = config.maxFileSize ? config.maxFileSize * 1024 * 1024 : undefined
    const minFileSizeBytes = config.minFileSize ? config.minFileSize * 1024 * 1024 : undefined
    
    if (maxFileSizeBytes && fileSize > maxFileSizeBytes) {
      return {
        allowed: false,
        reason: `File "${fileName}" size ${formatFileSize(fileSize)} exceeds maximum limit of ${config.maxFileSize} MB`,
        filterType: 'file_size',
        filterValue: `max:${config.maxFileSize}`,
      }
    }

    if (minFileSizeBytes && fileSize < minFileSizeBytes) {
      return {
        allowed: false,
        reason: `File "${fileName}" size ${formatFileSize(fileSize)} is below minimum limit of ${config.minFileSize} MB`,
        filterType: 'file_size',
        filterValue: `min:${config.minFileSize}`,
      }
    }
  }

  // Check MIME type
  if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
    const detectedMimeType = getMimeTypeFromExtension(fileName)
    if (!config.allowedMimeTypes.includes(detectedMimeType)) {
      return {
        allowed: false,
        reason: `File "${fileName}" MIME type "${detectedMimeType}" is not in allowed types: ${config.allowedMimeTypes.join(', ')}`,
        filterType: 'mime_type',
        filterValue: config.allowedMimeTypes.join(','),
      }
    }
  }

  return { allowed: true }
}

/**
 * Parse filter configuration from database JSON strings
 */
export function parseFilterConfig(crawler: {
  includePatterns?: string | null
  excludePatterns?: string | null
  maxFileSize?: number | null
  minFileSize?: number | null
  allowedMimeTypes?: string | null
}): FileFilterConfig {
  const config: FileFilterConfig = {}

  if (crawler.includePatterns) {
    try {
      config.includePatterns = JSON.parse(crawler.includePatterns)
    } catch (error) {
      console.warn('Failed to parse include patterns:', error)
    }
  }

  if (crawler.excludePatterns) {
    try {
      config.excludePatterns = JSON.parse(crawler.excludePatterns)
    } catch (error) {
      console.warn('Failed to parse exclude patterns:', error)
    }
  }

  if (crawler.allowedMimeTypes) {
    try {
      config.allowedMimeTypes = JSON.parse(crawler.allowedMimeTypes)
    } catch (error) {
      console.warn('Failed to parse allowed MIME types:', error)
    }
  }

  // File sizes are stored in MB in the database
  if (crawler.maxFileSize !== null && crawler.maxFileSize !== undefined) {
    config.maxFileSize = crawler.maxFileSize
  }

  if (crawler.minFileSize !== null && crawler.minFileSize !== undefined) {
    config.minFileSize = crawler.minFileSize
  }

  return config
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}
