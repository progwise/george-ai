/**
 * Crawl4AI service configuration
 */

export const CRAWL4AI_BASE_URL = process.env.CRAWL4AI_URL || 'http://gai-crawl4ai:11245'

// Default timeout for single page fetches (30 seconds)
export const DEFAULT_FETCH_TIMEOUT_MS = 30_000

// Default timeout for multi-page crawls (5 minutes)
export const DEFAULT_CRAWL_TIMEOUT_MS = 300_000
