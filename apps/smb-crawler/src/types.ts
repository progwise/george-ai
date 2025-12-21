/**
 * Internal types for the SMB crawler service
 */
import type { SMB2Client } from '@george-ai/smb2-client'
import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

export interface CrawlJob {
  /** Unique job identifier */
  jobId: string
  /** Crawl options */
  options: SmbCrawlOptions
  /** SMB2 client connection */
  client: SMB2Client
  /** Base path within the share */
  sharePath: string
  /** Job creation timestamp */
  createdAt: Date
  /** Job status */
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  /** Files discovered during crawl */
  files: Map<string, DiscoveredFile>
  /** SSE clients connected to this job */
  clients: Set<ServerSentEventClient>
  /** Error message if failed */
  error?: string
}

export interface DiscoveredFile {
  /** Unique file identifier */
  fileId: string
  /** File name */
  name: string
  /** Relative path from share root */
  relativePath: string
  /** Absolute path on filesystem */
  absolutePath: string
  /** File size in bytes */
  size: number
  /** MIME type */
  mimeType?: string
  /** Last modified timestamp */
  lastModified: Date
  /** SHA-256 hash of file content */
  hash: string
}

export interface ServerSentEventClient {
  response: import('express').Response
  jobId: string
}
