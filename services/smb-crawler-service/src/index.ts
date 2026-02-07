/**
 * SMB Crawler Service
 *
 * HTTP + SSE service for crawling SMB shares using SMB2 protocol
 */
import express from 'express'
import { z } from 'zod'

import { SmbCrawlOptionsSchema } from '@george-ai/smb-crawler-client'

import { logger } from './common'
import { initializeConnectionManager, listConnections } from './connection-manager'
import { addClient, cancelJob, createJob, getActiveJobs, getFile, getJob, startCrawl } from './job-manager'

const app = express()
app.use(express.json())

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3006

/**
 * Health check endpoint
 */
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'smb-crawler',
    version: '1.0.0',
  })
  logger.debug('Health check endpoint called')
})

/**
 * Start a new crawl job
 * POST /crawl/start
 * Body: SmbCrawlOptions
 * Returns: { jobId, streamUrl }
 */
app.post('/crawl/start', async (req, res) => {
  try {
    const options = SmbCrawlOptionsSchema.parse(req.body)

    // Create job and connect to share (but don't start crawling yet)
    const jobId = await createJob(options)

    // Note: Crawling will start when first client connects to SSE stream
    // This prevents race condition where events are sent before client connects

    res.json({
      jobId,
      streamUrl: `/crawl/${jobId}/stream`,
    })

    logger.debug('Crawl job created', { jobId, options })
  } catch (error) {
    logger.error('/crawl/start error', { error, body: req.body })

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

  try {
    const job = getJob(jobId)
    if (!job) {
      logger.error('SSE stream requested for non-existent job', { jobId })
      return res.status(404).json({
        success: false,
        error: `Job not found: ${jobId}`,
      })
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable Nginx buffering

    // Add client to job
    addClient(jobId, res)

    logger.debug('Client connected to SSE stream for job', { jobId, clientCount: job.clients.size })

    // Start crawling when first client connects (prevents race condition)
    if (job.status === 'pending') {
      logger.debug('Starting crawl for job', { jobId })
      startCrawl(jobId).catch((error) => {
        logger.error('Error starting crawl for job', { jobId, error })
      })
    }
    logger.debug('Crawl job status', { jobId, status: job.status })
  } catch (error) {
    logger.error('/crawl/{jobId}/stream error', { error, jobId })
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
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
      logger.error('File download requested for non-existent job', { jobId, fileId })
      return res.status(404).json({
        success: false,
        error: `Job not found: ${jobId}`,
      })
    }

    const file = getFile(jobId, fileId)
    if (!file) {
      logger.error('File download requested for non-existent file', { jobId, fileId })
      return res.status(404).json({
        success: false,
        error: `File not found: ${fileId} (job ${jobId})`,
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
      logger.error('Error streaming file', { fileId, error })
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Failed to stream file',
        })
      }
    })
    logger.debug('Started streaming file', { jobId, fileId, fileName: file.name })
  } catch (error) {
    logger.error('/files/{jobId}/{fileId} error', { error, jobId, fileId })
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
    logger.error('/crawl/{jobId} DELETE error', { error, jobId })
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
    logger.debug('Listed active connections', { count: connections.length })
  } catch (error) {
    logger.error('/connections error', { error })
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
    logger.debug('Listed active jobs', { count: jobs.length })
  } catch (error) {
    logger.error('/jobs error', { error })
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
      logger.info(`SMB Crawler Service listening on port ${PORT}`)
    })
    logger.debug('Server started', { port: PORT })
  } catch (error) {
    logger.error('Failed to start server:', { error })
    process.exit(1)
  }
}

// Start the service
start()
