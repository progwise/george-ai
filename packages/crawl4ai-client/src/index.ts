import { client } from './fetchClient'
import { ApiResponse } from './types'

interface CrawlOptions {
  url: string
  maxDepth: number
  maxPages: number
}

export const crawl = async ({ url, maxDepth, maxPages }: CrawlOptions) => {
  console.log('start crawling')

  const result = await client.POST('/crawl', {
    body: {
      urls: [url],
      crawler_config: {
        type: 'CrawlerRunConfig',
        params: {
          deep_crawl_strategy: {
            type: 'BestFirstCrawlingStrategy',
            params: {
              max_depth: maxDepth,
              max_pages: maxPages,
              include_external: false,
            },
          },
        },
      },
    },
  })

  const data = result.data as ApiResponse

  if (!data.success) {
    throw new Error('Crawl failed')
  }

  const files = data.results.map((result) => ({
    url: result.url,
    content: result.markdown.raw_markdown,
    title: result.metadata.title,
  }))

  return files
}
