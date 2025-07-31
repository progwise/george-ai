import { CrawlOptions } from './crawler-options'

export async function* crawlHttp({ uri, maxDepth, maxPages }: CrawlOptions) {
  yield `start smb crawling ${uri} and maxDepth: ${maxDepth} and maxPages ${maxPages}`
}
