import { FileFilterConfig } from '../file/file-filter'

export interface CrawlOptions {
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  crawlerRunId?: string
  filterConfig?: FileFilterConfig
}
