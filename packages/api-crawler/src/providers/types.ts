/**
 * API Provider Types
 * Defines the interface for platform-specific API providers
 */

// Re-export from main types
export type { AssociationsConfig, CustomProviderConfig } from '../types'

/**
 * Raw item from API response
 */
export type RawApiItem = Record<string, unknown>

/**
 * Fetch configuration passed to provider
 */
export type FetchConfig = {
  baseUrl: string
  endpoint: string
  headers: Record<string, string>
  requestDelay?: number
  associations?: string[]
}

/**
 * Provider interface - each supported platform implements this
 */
export interface ApiProvider {
  /**
   * Unique provider identifier
   */
  id: string

  /**
   * Human-readable provider name
   */
  name: string

  /**
   * Fetch all items from the API (handles pagination internally)
   */
  fetchItems(config: FetchConfig): AsyncGenerator<RawApiItem, void, void>

  /**
   * Build the unique origin URI for an item
   * Used for deduplication when re-crawling
   */
  buildOriginUri(baseUrl: string, item: RawApiItem): string | undefined

  /**
   * Extract the title/name from an item
   */
  extractTitle(item: RawApiItem): string | undefined

  /**
   * Generate markdown content from an item
   */
  generateMarkdown(item: RawApiItem): string
}
