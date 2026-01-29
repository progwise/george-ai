import { FileFilterConfig } from '../file/file-filter'

export type CrawlerConfig = unknown

export interface CrawlerCredentials {
  username: string
  password: string
}

export interface CrawlOptions {
  workspaceId: string
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  crawlerRunId?: string
  filterConfig?: FileFilterConfig
  crawlerConfig?: CrawlerConfig
  credentials?: CrawlerCredentials
}
