import { z } from 'zod'

// Request validation schemas
export const SmbCrawlOptionsSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  maxFileSizeBytes: z.number().positive().optional(),
  maxDepth: z.number().nonnegative().optional(),
})

export type SmbCrawlOptions = z.infer<typeof SmbCrawlOptionsSchema>

/**
 * File metadata discovered during crawl
 */

export const SmbFileMetadataSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  relativePath: z.string(),
  size: z.number().nonnegative(),
  mimeType: z.string().optional(),
  lastModified: z.date(),
  downloadUrl: z.string().url(),
})

export type SmbFileMetadata = z.infer<typeof SmbFileMetadataSchema>

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
