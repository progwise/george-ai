/**
 * @george-ai/api-crawler
 * API crawler package for George AI
 */

// Main functions
export { crawlApi, crawlApiStream, validateApiConnection } from './crawl'

// Types
export type {
  ApiCrawlerConfig,
  AuthType,
  AuthConfig,
  PaginationType,
  PaginationConfig,
  HttpMethod,
  CrawlItem,
  CrawlResult,
  ValidationResult,
} from './types'

// Templates
export {
  shopwareTemplate,
  createShopwareConfig,
  weclappTemplate,
  createWeclappConfig,
  genericRestTemplate,
} from './templates'

// Utilities (for advanced usage)
export { validateConfig, validateConfigSafe } from './utils/validate'
export { authenticate } from './auth'
export { paginateFetch } from './pagination'
export { mapFields, mapFieldsMulti } from './field-mapping'
