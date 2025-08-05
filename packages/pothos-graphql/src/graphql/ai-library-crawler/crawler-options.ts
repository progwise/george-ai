export interface CrawlOptions {
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  fileConverterOptions?: string
}
