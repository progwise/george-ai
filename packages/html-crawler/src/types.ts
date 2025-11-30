/**
 * Result from crawling a single HTML page
 */
export interface CrawlResult {
  /** The URL that was crawled */
  url: string
  /** Page title extracted from the HTML */
  title: string
  /** Markdown content extracted from the page */
  markdown: string
}

/**
 * Options for HTML crawling
 */
export interface CrawlOptions {
  /** Maximum depth for recursive crawling (0 = single page only) */
  maxDepth?: number
  /** Maximum number of pages to crawl */
  maxPages?: number
  /** Timeout in milliseconds for the crawl operation */
  timeoutMs?: number
}

/**
 * Error thrown when crawling fails
 */
export class CrawlError extends Error {
  constructor(
    message: string,
    public readonly url: string,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = 'CrawlError'
  }
}
