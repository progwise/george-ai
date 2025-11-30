import { CRAWL4AI_BASE_URL, DEFAULT_FETCH_TIMEOUT_MS } from './client'
import { CrawlError } from './types'

/**
 * Response from the /markdown endpoint (non-streaming single page fetch)
 */
interface SinglePageMarkdownResponse {
  success: boolean
  url?: string
  title?: string
  markdown?: string
  error?: string
}

/**
 * Fetch a single page and return its content as markdown.
 * Uses Crawl4AI for JavaScript rendering and clean content extraction.
 *
 * @param url - The URL to fetch
 * @param timeoutMs - Timeout in milliseconds (default: 30 seconds)
 * @returns The page content as markdown
 * @throws CrawlError if fetching fails
 */
export async function fetchPageAsMarkdown(url: string, timeoutMs?: number): Promise<string> {
  const timeout = timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS

  console.log(`[html-crawler] Fetching page as markdown: ${url}`)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${CRAWL4AI_BASE_URL}/markdown?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new CrawlError(`Crawl4AI HTTP ${response.status}: ${response.statusText}`, url)
    }

    const data: SinglePageMarkdownResponse = await response.json()

    if (!data.success) {
      throw new CrawlError(data.error || 'Crawl4AI crawl failed', url)
    }

    if (!data.markdown) {
      throw new CrawlError('Crawl4AI returned empty markdown', url)
    }

    console.log(`[html-crawler] Successfully fetched markdown (${data.markdown.length} chars)`)
    return data.markdown
  } catch (error) {
    if (error instanceof CrawlError) {
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new CrawlError(`Crawl4AI timeout after ${timeout}ms`, url, error)
    }

    // Check for connection errors
    if (message.includes('ECONNREFUSED') || message.includes('fetch failed')) {
      throw new CrawlError('Crawl4AI service unavailable', url, error instanceof Error ? error : undefined)
    }

    throw new CrawlError(`Crawl4AI error: ${message}`, url, error instanceof Error ? error : undefined)
  } finally {
    clearTimeout(timeoutId)
    controller.abort()
  }
}
