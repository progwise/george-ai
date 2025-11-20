/**
 * API Crawler Types
 * Pure TypeScript types for API crawling functionality
 */

/**
 * Authentication types supported
 */
export type AuthType = 'none' | 'apiKey' | 'oauth2' | 'basic' | 'bearer'

/**
 * Pagination strategies supported
 */
export type PaginationType = 'offset' | 'page' | 'cursor' | 'none'

/**
 * HTTP methods supported
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

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
 * Pagination configuration (type-specific)
 */
export type PaginationConfig = {
  // Offset-based
  limitParam?: string
  offsetParam?: string
  defaultLimit?: number

  // Page-based
  pageParam?: string
  pageSizeParam?: string
  defaultPageSize?: number

  // Cursor-based
  cursorParam?: string
  nextCursorPath?: string
}

/**
 * Complete API crawler configuration
 */
export type ApiCrawlerConfig = {
  // API endpoint
  baseUrl: string
  endpoint: string
  method: HttpMethod

  // Authentication
  authType: AuthType
  authConfig: AuthConfig

  // Request configuration
  headers?: Record<string, string>
  queryParams?: Record<string, string>

  // Pagination
  paginationType: PaginationType
  paginationConfig: PaginationConfig

  // Response parsing
  dataPath: string
  hasMorePath?: string
  totalCountPath?: string

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
export type CrawlItem = {
  title: string // Auto-extracted from raw data
  content: string // Simple string representation
  raw: unknown // Complete raw item - all data preserved
}

/**
 * Result from crawling operation
 */
export type CrawlResult = {
  items: CrawlItem[]
  totalFetched: number
  success: boolean
  error?: string
}

/**
 * Result from connection validation
 */
export type ValidationResult = {
  success: boolean
  error?: string
  errorType?: 'AUTHENTICATION_ERROR' | 'NETWORK_ERROR' | 'NOT_FOUND' | 'INVALID_CONFIG' | 'UNKNOWN_ERROR'
}

/**
 * HTTP request parameters
 */
export type HttpRequestParams = {
  baseUrl: string
  endpoint: string
  method: HttpMethod
  headers: Record<string, string>
  queryParams?: Record<string, string>
  body?: unknown
  timeout?: number
}

/**
 * HTTP response
 */
export type HttpResponse<T = unknown> = {
  data: T
  status: number
  headers: Record<string, string>
}
