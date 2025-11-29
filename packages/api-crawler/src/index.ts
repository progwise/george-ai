/**
 * @george-ai/api-crawler
 * API crawler package for George AI
 */

// Main functions
export { crawlApiStream } from './crawl'

// Types
export type { ApiCrawlerConfig } from './types'

// Templates
export {
  shopwareTemplate,
  createShopwareConfig,
  weclappTemplate,
  createWeclappConfig,
  genericRestTemplate,
} from './templates'
