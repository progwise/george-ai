/**
 * SMB Crawler Service
 *
 * HTTP + SSE service for crawling SMB shares using SMB2 protocol
 */
import express from 'express'
import { z } from 'zod'

import type { SmbCrawlOptions } from '@george-ai/smb-crawler'

import { initializeConnectionManager, listConnections } from './connection-manager'
import { addClient, cancelJob, createJob, getActiveJobs, getFile, getJob, startCrawl } from './job-manager'

const app = express()
app.use(express.json())

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006

// Request validation schemas
const crawlOptionsSchema = z.object({
  uri: z.string().min(1, 'URI is required'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  includePatterns: z.array(z.string()).optional(),
  excludePatterns: z.array(z.string()).optional(),
  maxFileSizeBytes: z.number().positive().optional(),
})

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'smb-crawler',
    version: '1.0.0',
  })
})

/**
 * Start a new crawl job
 * POST /crawl/start
 * Body: SmbCrawlOptions
 * Returns: { jobId, streamUrl }
 */
app.post('/crawl/start', async (req, res) => {
  try {
    const options = crawlOptionsSchema.parse(req.body) as SmbCrawlOptions

    // Create job and mount share (but don't start crawling yet)
    const jobId = await createJob(options)

    // Note: Crawling will start when first client connects to SSE stream
    // This prevents race condition where events are sent before client connects

    res.json({
      jobId,
      streamUrl: `/crawl/${jobId}/stream`,
    })
  } catch (error) {
    console.error('[API] /crawl/start error:', error)

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request',
        details: error.errors,
      })
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Stream crawl events via SSE
 * GET /crawl/:jobId/stream
 * Returns: SSE stream with events: file-found, progress, complete, error
 */
app.get('/crawl/:jobId/stream', (req, res) => {
  const { jobId } = req.params

  const job = getJob(jobId)
  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
    })
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering

  // Add client to job
  addClient(jobId, res)

  console.log(`[API] SSE client connected to job ${jobId}`)

  // Start crawling when first client connects (prevents race condition)
  if (job.status === 'pending') {
    console.log(`[API] Starting crawl for job ${jobId} now that client is connected`)
    startCrawl(jobId).catch((error) => {
      console.error(`[API] Crawl job ${jobId} failed:`, error)
    })
  }
})

/**
 * Download a file from a crawl job
 * GET /files/:jobId/:fileId
 * Returns: Binary file stream
 */
app.get('/files/:jobId/:fileId', async (req, res) => {
  const { jobId, fileId } = req.params

  try {
    const job = getJob(jobId)
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      })
    }

    const file = getFile(jobId, fileId)
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      })
    }

    // Set headers
    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream')
    res.setHeader('Content-Length', file.size)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.name)}"`)

    // Stream file using SMB2 client
    const fileStream = job.client.createReadStream(file.absolutePath)
    fileStream.pipe(res)

    fileStream.on('error', (error: Error) => {
      console.error(`[API] Error streaming file ${fileId}:`, error)
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream file',
        })
      }
    })
  } catch (error) {
    console.error(`[API] /files/${jobId}/${fileId} error:`, error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Cancel a crawl job and clean up resources
 * DELETE /crawl/:jobId
 */
app.delete('/crawl/:jobId', async (req, res) => {
  const { jobId } = req.params

  try {
    await cancelJob(jobId)

    res.json({
      success: true,
    })
  } catch (error) {
    console.error(`[API] /crawl/${jobId} DELETE error:`, error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * List all active connections (debugging)
 * GET /connections
 */
app.get('/connections', async (_req, res) => {
  try {
    const connections = listConnections()
    res.json({
      success: true,
      connections,
    })
  } catch (error) {
    console.error('[API] /connections error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * List all active jobs (debugging)
 * GET /jobs
 */
app.get('/jobs', (_req, res) => {
  try {
    const jobs = getActiveJobs()
    res.json({
      success: true,
      jobs,
    })
  } catch (error) {
    console.error('[API] /jobs error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

/**
 * Initialize and start server
 */
async function start(): Promise<void> {
  try {
    // Initialize connection manager
    await initializeConnectionManager()

    // Start server
    app.listen(PORT, () => {
      console.log(`SMB Crawler Service listening on port ${PORT}`)
      console.log(`Health check: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the service
start()
