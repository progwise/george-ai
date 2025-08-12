import { FileFilterConfig } from './file-filter'

export interface CrawlOptions {
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  crawlerRunId?: string
  filterConfig?: FileFilterConfig
}
