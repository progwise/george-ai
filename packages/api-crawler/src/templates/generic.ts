/**
 * Generic REST API template
 * Minimal starting point for custom API integrations
 */
import type { ApiCrawlerConfig } from '../types'

/**
 * Generic REST API crawler template
 * User must configure: baseUrl, endpoint, authType, authConfig, dataPath
 * Title and content are auto-extracted from the API response
 */
export const genericRestTemplate: Partial<ApiCrawlerConfig> = {
  method: 'GET',
  authType: 'none',
  authConfig: {},
  paginationType: 'none',
  paginationConfig: {},
  requestDelay: 100,
  maxConcurrency: 3,
}
