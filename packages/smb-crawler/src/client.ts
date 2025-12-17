/**
 * SMB Crawler Client
 *
 * Provides a client for interacting with the SMB crawler service via SSE and HTTP
 */
import { EventSource } from 'eventsource'

import type {
  SmbCrawlComplete,
  SmbCrawlError,
  SmbCrawlEvent,
  SmbCrawlOptions,
  SmbCrawlProgress,
  SmbFileMetadata,
  StartCrawlResponse,
} from './types'

export interface SmbCrawlerClientOptions {
  /** Base URL of the SMB crawler service */
  baseUrl: string
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
}

/**
 * Client for the SMB crawler service
 */
export class SmbCrawlerClient {
  private baseUrl: string
  private timeout: number

  constructor(options: SmbCrawlerClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.timeout = options.timeout ?? 30000
  }

  /**
   * Start a new crawl job
   */
  async startCrawl(options: SmbCrawlOptions): Promise<StartCrawlResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/crawl/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options),
        signal: controller.signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(error.error || `Crawler service returned ${response.status}`)
      }

      const data = (await response.json()) as StartCrawlResponse
      return data
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Stream events from a crawl job
   * Returns an async generator that yields crawl events
   */
  async *streamCrawl(jobId: string): AsyncGenerator<SmbCrawlEvent, void, unknown> {
    const streamUrl = `${this.baseUrl}/crawl/${jobId}/stream`
    const eventSource = new EventSource(streamUrl)

    try {
      const eventQueue: SmbCrawlEvent[] = []
      let resolveNext: ((value: IteratorResult<SmbCrawlEvent>) => void) | null = null
      let isComplete = false
      let error: Error | null = null

      // Handle file-found events
      eventSource.addEventListener('file-found', (event: MessageEvent) => {
        const data = JSON.parse(event.data) as SmbFileMetadata
        const crawlEvent: SmbCrawlEvent = { type: 'file-found', data }
        if (resolveNext) {
          resolveNext({ value: crawlEvent, done: false })
          resolveNext = null
        } else {
          eventQueue.push(crawlEvent)
        }
      })

      // Handle progress events
      eventSource.addEventListener('progress', (event: MessageEvent) => {
        const data = JSON.parse(event.data) as SmbCrawlProgress
        const crawlEvent: SmbCrawlEvent = { type: 'progress', data }
        if (resolveNext) {
          resolveNext({ value: crawlEvent, done: false })
          resolveNext = null
        } else {
          eventQueue.push(crawlEvent)
        }
      })

      // Handle complete events
      eventSource.addEventListener('complete', (event: MessageEvent) => {
        const data = JSON.parse(event.data) as SmbCrawlComplete
        const crawlEvent: SmbCrawlEvent = { type: 'complete', data }
        if (resolveNext) {
          resolveNext({ value: crawlEvent, done: false })
          resolveNext = null
        } else {
          eventQueue.push(crawlEvent)
        }
        isComplete = true
        eventSource.close()
      })

      // Handle error events
      eventSource.addEventListener('error', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as SmbCrawlError
          const crawlEvent: SmbCrawlEvent = { type: 'error', data }
          if (resolveNext) {
            resolveNext({ value: crawlEvent, done: false })
            resolveNext = null
          } else {
            eventQueue.push(crawlEvent)
          }
        } catch {
          // If we can't parse the error, treat it as a connection error
          error = new Error('SSE connection error')
          if (resolveNext) {
            resolveNext({ value: undefined as never, done: true })
            resolveNext = null
          }
        }
        eventSource.close()
      })

      // Yield events from the queue
      while (true) {
        // Always check queue first, even if complete
        if (eventQueue.length > 0) {
          const event = eventQueue.shift()!
          yield event
        } else if (isComplete || error) {
          // Only exit after queue is empty
          break
        } else {
          // Wait for next event
          const result = await new Promise<IteratorResult<SmbCrawlEvent>>((resolve) => {
            resolveNext = resolve
          })
          if (!result.done && result.value) {
            yield result.value
          }
        }
      }

      if (error) {
        throw error
      }
    } finally {
      eventSource.close()
    }
  }

  /**
   * Download a file from a crawl job
   * Returns a readable stream of the file content
   */
  async downloadFile(jobId: string, fileId: string): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${this.baseUrl}/files/${jobId}/${fileId}`)

    if (!response.ok) {
      throw new Error(`Failed to download file: HTTP ${response.status}`)
    }

    if (!response.body) {
      throw new Error('Response body is null')
    }

    return response.body
  }

  /**
   * Cancel a crawl job and clean up resources
   */
  async cancelCrawl(jobId: string): Promise<void> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(`${this.baseUrl}/crawl/${jobId}`, {
        method: 'DELETE',
        signal: controller.signal,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
        throw new Error(error.error || `Failed to cancel crawl: HTTP ${response.status}`)
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * Check if the crawler service is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch {
      return false
    }
  }
}
