/**
 * SMB Crawler Types
 *
 * This package provides types for crawling SMB shares using SSE streaming
 */

/**
 * Options for starting an SMB crawl job
 */
export interface SmbCrawlOptions {
  /** SMB share URI (e.g., smb://server/share or //server/share/path) */
  uri: string
  /** Username for SMB authentication */
  username: string
  /** Password for SMB authentication */
  password: string
  /** File patterns to include (e.g., ['*.pdf', '*.docx']) */
  includePatterns?: string[]
  /** File patterns to exclude (e.g., ['*.tmp', '~*']) */
  excludePatterns?: string[]
  /** Maximum file size in bytes (files larger than this are skipped) */
  maxFileSizeBytes?: number
}

/**
 * File metadata discovered during crawl
 */
export interface SmbFileMetadata {
  /** Unique file identifier within this job */
  fileId: string
  /** File name */
  name: string
  /** Relative path from mount point */
  relativePath: string
  /** File size in bytes */
  size: number
  /** MIME type (if detectable) */
  mimeType?: string
  /** Last modified timestamp */
  lastModified: Date
  /** SHA-256 hash of file content */
  hash: string
  /** URL to download this file */
  downloadUrl: string
}

/**
 * Progress update during crawl
 */
export interface SmbCrawlProgress {
  /** Total files discovered so far */
  filesFound: number
  /** Files that matched filters */
  filesMatched: number
  /** Total bytes discovered */
  totalBytes: number
  /** Current directory being scanned */
  currentDirectory?: string
}

/**
 * Crawl completion result
 */
export interface SmbCrawlComplete {
  /** Total files found */
  totalFiles: number
  /** Total files matched filters */
  totalMatched: number
  /** Total bytes */
  totalBytes: number
  /** Crawl duration in milliseconds */
  durationMs: number
}

/**
 * Error during crawl
 */
export interface SmbCrawlError {
  /** Error message */
  message: string
  /** Error code (if applicable) */
  code?: string
  /** Path where error occurred */
  path?: string
}

/**
 * SSE event types emitted by the crawler service
 */
export type SmbCrawlEvent =
  | { type: 'file-found'; data: SmbFileMetadata }
  | { type: 'progress'; data: SmbCrawlProgress }
  | { type: 'complete'; data: SmbCrawlComplete }
  | { type: 'error'; data: SmbCrawlError }

/**
 * Response from starting a crawl job
 */
export interface StartCrawlResponse {
  /** Unique job identifier */
  jobId: string
  /** URL to stream events from */
  streamUrl: string
}

/**
 * Response from the crawler service API
 */
export interface CrawlerServiceResponse<T = unknown> {
  success: boolean
  error?: string
  data?: T
}
