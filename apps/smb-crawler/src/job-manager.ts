/**
 * Job Manager
 *
 * Manages crawl jobs, SSE clients, and automatic cleanup
 */
import type { Response } from 'express'
import { randomUUID } from 'node:crypto'

import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

import { crawlDirectory } from './file-crawler'
import { mountShare, unmountShare } from './mount-manager'
import type { CrawlJob, DiscoveredFile, ServerSentEventClient } from './types'

// Store active jobs
const jobs = new Map<string, CrawlJob>()

// Cleanup jobs after 1 hour of inactivity
const JOB_CLEANUP_TIMEOUT_MS = 60 * 60 * 1000

/**
 * Create a new crawl job
 */
export async function createJob(options: SmbCrawlOptions): Promise<string> {
  const jobId = randomUUID()

  console.log(`[JobManager] Creating job ${jobId}`)

  // Mount the SMB share
  const mountResult = await mountShare({
    crawlerId: jobId,
    uri: options.uri,
    username: options.username,
    password: options.password,
  })

  if (!mountResult.success) {
    throw new Error(`Failed to mount SMB share: ${mountResult.error}`)
  }

  // Create job
  const job: CrawlJob = {
    jobId,
    options,
    mountPoint: mountResult.mountPoint!,
    credentialsFile: `/app/.smb-credentials/${jobId}.creds`,
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
    throw new Error(`Job not found: ${jobId}`)
  }

  if (job.status !== 'pending') {
    throw new Error(`Job ${jobId} is already ${job.status}`)
  }

  console.log(`[JobManager] Starting crawl for job ${jobId}`)
  job.status = 'running'

  const startTime = Date.now()

  try {
    // Emit start event
    sendEventToClients(job, 'progress', {
      filesFound: 0,
      filesMatched: 0,
      totalBytes: 0,
    })

    // Crawl directory and emit events
    for await (const file of crawlDirectory(job.mountPoint, job.options, (stats) => {
      // Send progress update
      sendEventToClients(job, 'progress', stats)
    })) {
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
        hash: file.hash,
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

    console.log(`[JobManager] Job ${jobId} completed: ${job.files.size} files in ${durationMs}ms`)
  } catch (error) {
    console.error(`[JobManager] Job ${jobId} failed:`, error)
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

  console.log(`[JobManager] Cancelling job ${jobId}`)
  job.status = 'cancelled'

  // Close all SSE connections
  for (const client of job.clients) {
    try {
      client.response.end()
    } catch {
      // Ignore errors when closing
    }
  }
  job.clients.clear()

  // Unmount share
  await unmountShare(jobId)

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
  console.log(`[JobManager] Client connected to job ${jobId} (${job.clients.size} total)`)

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
    console.log(`[JobManager] Client disconnected from job ${jobId} (${job.clients.size} remaining)`)
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
    console.warn(`[JobManager] Failed to send event to client:`, error)
  }
}

/**
 * Schedule job cleanup after timeout
 */
function scheduleJobCleanup(jobId: string): void {
  setTimeout(async () => {
    const job = jobs.get(jobId)
    if (!job) {
      return
    }

    // Only clean up if no clients are connected and job is done
    if (job.clients.size === 0 && (job.status === 'completed' || job.status === 'failed')) {
      console.log(`[JobManager] Cleaning up inactive job ${jobId}`)
      await cancelJob(jobId)
    } else {
      // Reschedule cleanup
      scheduleJobCleanup(jobId)
    }
  }, JOB_CLEANUP_TIMEOUT_MS)
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
