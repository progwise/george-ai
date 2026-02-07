/**
 * Crawled item with raw data
 */
export type ApiCrawlItem = {
  title: string // Auto-extracted from raw data
  content: string // Simple string representation
  raw: unknown // Complete raw item - all data preserved
  originUri: string // The URI that was fetched to retrieve this item
}
