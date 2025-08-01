import { CrawlOptions } from './crawler-options'

export async function* crawlSmb({ uri, maxDepth, maxPages }: CrawlOptions) {
  console.log(`start smb crawling ${uri} and maxDepth: ${maxDepth} and maxPages ${maxPages}`)
  yield { uri, markdown: null, metaData: null, error: 'SMB crawler not implemented' }
}
