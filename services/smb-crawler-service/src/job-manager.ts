/**
 * Job Manager
 *
 * Manages crawl jobs, SSE clients, and automatic cleanup
 */
import type { Response } from 'express'
import { randomUUID } from 'node:crypto'

import { type SmbCrawlOptions, logger } from './common'
import { closeConnection, createConnection } from './connection-manager'
import { crawlDirectory } from './file-crawler'
import type { CrawlJob, DiscoveredFile, ServerSentEventClient } from './types'

// Store active jobs
const jobs = new Map<string, CrawlJob>()

// Cleanup jobs after 1 hour of inactivity
const JOB_CLEANUP_TIMEOUT_MS = 60 * 60 * 1000

// Store cleanup timeouts to prevent unbounded recursion
const cleanupTimeouts = new Map<string, NodeJS.Timeout>()

/**
 * Create a new crawl job
 */
export async function createJob(options: SmbCrawlOptions): Promise<string> {
  const jobId = randomUUID()

  logger.debug('Creating new crawl job', { jobId, options })

  // Create SMB2 connection
  const connectionResult = await createConnection({
    crawlerId: jobId,
    uri: options.uri,
    username: options.username,
    password: options.password,
  })

  if (!connectionResult.success) {
    throw new Error(`Failed to connect to SMB share: ${connectionResult.error}`)
  }

  // Create job
  const job: CrawlJob = {
    jobId,
    options,
    client: connectionResult.client!,
    sharePath: connectionResult.sharePath!,
    createdAt: new Date(),
    status: 'pending',
    files: new Map(),
    clients: new Set(),
  }

  jobs.set(jobId, job)

  // Schedule cleanup
  scheduleJobCleanup(jobId)

  return jobId
}

/**
 * Get a job by ID
 */
export function getJob(jobId: string): CrawlJob | undefined {
  return jobs.get(jobId)
}

/**
 * Start crawling a job
 */
export async function startCrawl(jobId: string): Promise<void> {
  const job = jobs.get(jobId)
  if (!job) {
    logger.error('Start crawl failed: Job not found', { jobId })
    throw new Error(`Job not found: ${jobId}`)
  }

  if (job.status !== 'pending') {
    logger.error('Start crawl failed: Job not in pending state', { job })
    throw new Error(`Job ${jobId} is already ${job.status}`)
  }

  job.status = 'running'
  const startTime = Date.now()
  logger.debug('Starting crawl for job', { job, startTime })

  try {
    // Emit start event
    sendEventToClients(job, 'progress', {
      filesFound: 0,
      filesMatched: 0,
      totalBytes: 0,
    })

    // Crawl directory and emit events
    for await (const file of crawlDirectory(
      job.client,
      {
        basePath: job.sharePath,
        jobId: job.jobId,
        maxFileSizeBytes: job.options.maxFileSizeBytes,
        includePatterns: job.options.includePatterns,
        excludePatterns: job.options.excludePatterns,
      },
      (stats) => {
        // Send progress update
        sendEventToClients(job, 'progress', stats)
      },
    )) {
      // Store file metadata
      job.files.set(file.fileId, file)

      // Send file-found event
      sendEventToClients(job, 'file-found', {
        fileId: file.fileId,
        name: file.name,
        relativePath: file.relativePath,
        size: file.size,
        mimeType: file.mimeType,
        lastModified: file.lastModified,
        downloadUrl: `/files/${jobId}/${file.fileId}`,
      })
    }

    // Emit completion event
    const durationMs = Date.now() - startTime
    job.status = 'completed'

    sendEventToClients(job, 'complete', {
      totalFiles: job.files.size,
      totalMatched: job.files.size,
      totalBytes: Array.from(job.files.values()).reduce((sum, f) => sum + f.size, 0),
      durationMs,
    })

    logger.info('Job completed', { job, durationMs })
  } catch (error) {
    logger.error('Job failed', { job, error })
    job.status = 'failed'
    job.error = error instanceof Error ? error.message : String(error)
    // Send error event
    sendEventToClients(job, 'error', {
      message: job.error,
    })
  }
}

/**
 * Cancel a job and clean up resources
 */
export async function cancelJob(jobId: string): Promise<void> {
  const job = jobs.get(jobId)
  if (!job) {
    return
  }

  logger.debug('Cancelling job', { jobId })
  job.status = 'cancelled'

  // Clear cleanup timeout to prevent memory leaks
  const timeout = cleanupTimeouts.get(jobId)
  if (timeout) {
    clearTimeout(timeout)
    cleanupTimeouts.delete(jobId)
  }

  // Close all SSE connections
  for (const client of job.clients) {
    try {
      client.response.end()
    } catch {
      // Ignore errors when closing
    }
  }
  job.clients.clear()

  // Close SMB2 connection
  await closeConnection(jobId)

  // Remove job
  jobs.delete(jobId)
}

/**
 * Add SSE client to a job
 */
export function addClient(jobId: string, response: Response): void {
  const job = jobs.get(jobId)
  if (!job) {
    throw new Error(`Job not found: ${jobId}`)
  }

  const client: ServerSentEventClient = {
    response,
    jobId,
  }

  job.clients.add(client)
  logger.debug('Client connected to job', { jobId, clientCount: job.clients.size })

  // Send initial state if job is already completed/failed
  if (job.status === 'completed') {
    sendEventToClient(client, 'complete', {
      totalFiles: job.files.size,
      totalMatched: job.files.size,
      totalBytes: Array.from(job.files.values()).reduce((sum, f) => sum + f.size, 0),
      durationMs: 0,
    })
  } else if (job.status === 'failed' && job.error) {
    sendEventToClient(client, 'error', {
      message: job.error,
    })
  }

  // Remove client when connection closes
  response.on('close', () => {
    job.clients.delete(client)
    logger.debug('Client disconnected from job', { jobId, clientCount: job.clients.size })
  })
}

/**
 * Get file from a job
 */
export function getFile(jobId: string, fileId: string): DiscoveredFile | undefined {
  const job = jobs.get(jobId)
  if (!job) {
    return undefined
  }

  return job.files.get(fileId)
}

/**
 * Send event to all clients of a job
 */
function sendEventToClients(job: CrawlJob, event: string, data: unknown): void {
  for (const client of job.clients) {
    sendEventToClient(client, event, data)
  }
}

/**
 * Send event to a single client
 */
function sendEventToClient(client: ServerSentEventClient, event: string, data: unknown): void {
  try {
    client.response.write(`event: ${event}\n`)
    client.response.write(`data: ${JSON.stringify(data)}\n\n`)
  } catch (error) {
    logger.warn('Failed to send event to client', { error })
  }
}

/**
 * Schedule job cleanup after timeout
 */
function scheduleJobCleanup(jobId: string): void {
  // Clear any existing cleanup timeout for this job
  const existingTimeout = cleanupTimeouts.get(jobId)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  const timeout = setTimeout(async () => {
    const job = jobs.get(jobId)
    if (!job) {
      cleanupTimeouts.delete(jobId)
      return
    }

    // Only clean up if no clients are connected and job is done
    if (job.clients.size === 0 && (job.status === 'completed' || job.status === 'failed')) {
      logger.debug('Cleaning up inactive job', { jobId })
      cleanupTimeouts.delete(jobId)
      await cancelJob(jobId)
    } else {
      // Reschedule cleanup (will replace the current timeout)
      scheduleJobCleanup(jobId)
    }
  }, JOB_CLEANUP_TIMEOUT_MS)

  cleanupTimeouts.set(jobId, timeout)
}

/**
 * Get all active jobs (for debugging)
 */
export function getActiveJobs(): Array<{ jobId: string; status: string; filesFound: number; clients: number }> {
  return Array.from(jobs.values()).map((job) => ({
    jobId: job.jobId,
    status: job.status,
    filesFound: job.files.size,
    clients: job.clients.size,
  }))
}
