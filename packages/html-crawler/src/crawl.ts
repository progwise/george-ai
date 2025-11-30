import { CRAWL4AI_BASE_URL, DEFAULT_CRAWL_TIMEOUT_MS } from './client'
import { CrawlError, CrawlOptions, CrawlResult } from './types'

/**
 * Stream HTML pages from a URL using Crawl4AI.
 * Yields CrawlResult objects as pages are crawled.
 *
 * @param url - The URL to start crawling from
 * @param options - Crawl options (maxDepth, maxPages, timeoutMs)
 * @yields CrawlResult objects containing url, title, and markdown
 * @throws CrawlError if crawling fails
 */
export async function* crawlHtmlStream(url: string, options?: CrawlOptions): AsyncGenerator<CrawlResult, void, void> {
  const maxDepth = options?.maxDepth ?? 2
  const maxPages = options?.maxPages ?? 10
  const timeoutMs = options?.timeoutMs ?? DEFAULT_CRAWL_TIMEOUT_MS

  console.log(`[html-crawler] Starting crawl of ${url} (maxDepth=${maxDepth}, maxPages=${maxPages})`)

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  let controller: AbortController | undefined

  try {
    controller = new AbortController()
    const timeoutId = setTimeout(() => controller!.abort(), timeoutMs)

    try {
      const response = await fetch(
        `${CRAWL4AI_BASE_URL}/crawl?url=${encodeURIComponent(url)}&maxDepth=${maxDepth}&maxPages=${maxPages}`,
        {
          signal: controller.signal,
          method: 'GET',
          headers: {
            'Content-Type': 'application/jsonl',
          },
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new CrawlError(`Crawl4AI HTTP ${response.status}: ${response.statusText}`, url)
      }

      reader = response.body?.getReader()
      if (!reader) {
        throw new CrawlError('Failed to get response body reader', url)
      }

      let readMode: 'read-metadata' | 'read-markdown' | null = null
      let currentMetadata: string | null = null
      let currentMarkdown: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('[html-crawler] Stream finished')
          break
        }

        const textValue = new TextDecoder('utf-8').decode(value, { stream: true })
        const lines = textValue.split('\n').filter((line) => line.trim() !== '')

        if (lines.length === 0) {
          continue
        }

        for (const line of lines) {
          if (line.startsWith('---BEGIN CRAWLER RESULT---')) {
            readMode = 'read-metadata'
            currentMetadata = null
            currentMarkdown = null
          } else if (line.startsWith('---END CRAWLER RESULT---')) {
            if (!currentMetadata) {
              console.warn('[html-crawler] Empty metadata during crawl')
            } else {
              const metaData = JSON.parse(currentMetadata)
              yield {
                url: metaData.url || url,
                title: metaData.title || 'No title',
                markdown: currentMarkdown || '',
              }
            }
            readMode = null
            currentMetadata = null
            currentMarkdown = null
          } else if (line.startsWith('---BEGIN MARKDOWN---')) {
            readMode = 'read-markdown'
            currentMarkdown = null
          } else {
            if (readMode === 'read-metadata') {
              if (currentMetadata) {
                currentMetadata += '\n' + line
              } else {
                currentMetadata = line
              }
            } else if (readMode === 'read-markdown') {
              if (currentMarkdown) {
                currentMarkdown += '\n' + line
              } else {
                currentMarkdown = line
              }
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    if (error instanceof CrawlError) {
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)

    if (error instanceof Error && error.name === 'AbortError') {
      throw new CrawlError(`Crawl4AI timeout after ${timeoutMs}ms`, url, error)
    }

    throw new CrawlError(`Crawl4AI error: ${message}`, url, error instanceof Error ? error : undefined)
  } finally {
    if (reader) {
      try {
        await reader.cancel()
        console.log(`[html-crawler] Reader cancelled for ${url}`)
      } catch (err) {
        console.error(`[html-crawler] Error cancelling reader for ${url}:`, err)
      }
    }
    if (controller && !controller.signal.aborted) {
      controller.abort()
    }
  }

  console.log(`[html-crawler] Finished crawling ${url}`)
}
