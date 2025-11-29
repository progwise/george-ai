/**
 * API Crawler Types
 * Pure TypeScript types for API crawling functionality
 */

/**
 * Authentication types supported
 */
export type AuthType = 'none' | 'apiKey' | 'oauth2' | 'basic' | 'bearer'

/**
 * Authentication configuration (type-specific)
 */
export type AuthConfig = {
  // API Key
  apiKey?: string
  apiKeyHeader?: string

  // OAuth2
  clientId?: string
  clientSecret?: string
  tokenUrl?: string
  scope?: string
  accessToken?: string

  // Basic Auth
  username?: string
  password?: string

  // Bearer Token
  token?: string
}

/**
 * Provider types supported
 */
export type ProviderType = 'shopware6' | 'shopware5' | 'weclapp' | 'jtl' | 'custom'

/**
 * Custom provider configuration
 * Used when provider is 'custom' - user configures how to extract data
 */
export type CustomProviderConfig = {
  /**
   * Field path to use as unique identifier (e.g., 'id', 'productNumber', 'sku')
   * If not set, common fields will be tried automatically
   */
  identifierField?: string

  /**
   * Field path to extract title from (e.g., 'name', 'translated.name')
   * If not set, common fields will be tried automatically
   */
  titleField?: string
}

/**
 * Complete API crawler configuration
 */
export type ApiCrawlerConfig = {
  // Provider type - determines how to extract data
  provider?: ProviderType
  providerConfig?: CustomProviderConfig

  // API endpoint
  baseUrl: string
  endpoint: string

  // Authentication
  authType: AuthType
  authConfig: AuthConfig

  // Request configuration
  headers?: Record<string, string>
  queryParams?: Record<string, string>

  // Rate limiting
  requestDelay?: number
  maxConcurrency?: number

  // Error handling
  retryCount?: number
  retryDelay?: number
}

/**
 * Crawled item with raw data
 */
export type ApiCrawlItem = {
  title: string // Auto-extracted from raw data
  content: string // Simple string representation
  raw: unknown // Complete raw item - all data preserved
  originUri: string // The URI that was fetched to retrieve this item
}
