import type { ApiCrawlerConfig } from '@george-ai/api-crawler'

import { FileFilterConfig } from '../file/file-filter'

export interface CrawlOptions {
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  crawlerRunId?: string
  filterConfig?: FileFilterConfig
  crawlerConfig?: ApiCrawlerConfig
}
