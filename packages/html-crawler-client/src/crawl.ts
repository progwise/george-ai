import { CRAWL4AI_BASE_URL, DEFAULT_CRAWL_TIMEOUT_MS } from './client'
import { logger } from './common'
import { HtmlCrawlError, HtmlCrawlOptions, HtmlCrawlResult } from './types'

/**
 * Stream HTML pages from a URL using Crawl4AI.
 * Yields HtmlCrawlResult objects as pages are crawled.
 *
 * @param url - The URL to start crawling from
 * @param options - Crawl options (maxDepth, maxPages, timeoutMs)
 * @yields HtmlCrawlResult objects containing url, title, and markdown
 * @throws HtmlCrawlError if crawling fails
 */
export async function* crawlHtmlStream(
  url: string,
  options?: HtmlCrawlOptions,
): AsyncGenerator<HtmlCrawlResult, void, void> {
  const maxDepth = options?.maxDepth ?? 2
  const maxPages = options?.maxPages ?? 10
  const timeoutMs = options?.timeoutMs ?? DEFAULT_CRAWL_TIMEOUT_MS

  logger.info('Starting crawl', { url, maxDepth, maxPages, timeoutMs })

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined

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

    if (!response.ok) {
      logger.error('Crawl4AI responded with error', {
        status: response.status,
        statusText: response.statusText,
        url,
        options,
      })
      throw new HtmlCrawlError(`Crawl4AI HTTP ${response.status}: ${response.statusText}`, url)
    }

    reader = response.body?.getReader()
    if (!reader) {
      logger.error('Failed to get response body reader from Crawl4AI', { url, options })
      throw new HtmlCrawlError('Failed to get response body reader', url)
    }

    let readMode: 'read-metadata' | 'read-markdown' | null = null
    let currentMetadata: string | null = null
    let currentMarkdown: string | null = null

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        logger.info('Stream finished', { url })
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
            logger.warn('Empty metadata during crawl', { url, options })
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
            currentMetadata = currentMetadata ? currentMetadata + '\n' + line : line
          } else if (readMode === 'read-markdown') {
            currentMarkdown = currentMarkdown ? currentMarkdown + '\n' + line : line
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof HtmlCrawlError) {
      throw error
    }

    const message = error instanceof Error ? error.message : String(error)

    if (error instanceof Error && error.name === 'AbortError') {
      logger.error('Crawl4AI request timed out', { url, timeoutMs })
      throw new HtmlCrawlError(`Crawl4AI timeout after ${timeoutMs}ms`, url, error)
    }

    logger.error('Error during Crawl4AI streaming', { url, error })
    throw new HtmlCrawlError(`Crawl4AI error: ${message}`, url, error instanceof Error ? error : undefined)
  } finally {
    clearTimeout(timeoutId)
    reader?.releaseLock()
  }

  logger.info('Finished crawling', { url, maxDepth, maxPages, timeoutMs })
}
