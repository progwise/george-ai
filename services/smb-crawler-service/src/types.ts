/**
 * Internal types for the SMB crawler service
 */
import type { SMB2Client } from '@george-ai/smb2-client'

import type { SmbCrawlOptions, SmbFileMetadata } from './common'

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

export interface DiscoveredFile extends SmbFileMetadata {
  absolutePath: string
}

export interface ServerSentEventClient {
  response: import('express').Response
  jobId: string
}
