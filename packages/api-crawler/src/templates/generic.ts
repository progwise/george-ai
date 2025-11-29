/**
 * Generic REST API template
 * Minimal starting point for custom API integrations
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Generic REST API crawler template
 * User must configure: baseUrl, endpoint, authType, authConfig
 * Uses 'custom' provider - can configure identifierField and titleField
 * Provider handles pagination internally
 */
export const genericRestTemplate: Partial<ApiCrawlerConfig> = {
  provider: 'custom',
  authType: 'none',
  authConfig: {},
  requestDelay: 100,
  maxConcurrency: 3,
}
