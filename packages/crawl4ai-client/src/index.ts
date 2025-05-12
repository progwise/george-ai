import { client, getCrawl4AiToken } from './fetchClient'
import { ApiResponse } from './types'

interface CrawlOptions {
  url: string
  maxDepth: number
  maxPages: number
}

export async function* crawl({ url, maxDepth, maxPages }: CrawlOptions) {
  yield `start crawling ${url}`

  // const result = await client.POST('/crawl/stream', {
  //   body: {
  //     urls: [url],
  //     crawler_config: {
  //       type: 'CrawlerRunConfig',
  //       params: {
  //         deep_crawl_strategy: {
  //           type: 'BestFirstCrawlingStrategy',
  //           params: {
  //             max_depth: maxDepth,
  //             max_pages: maxPages,
  //             include_external: false,
  //           },
  //         },
  //       },
  //     },
  //   },
  // })

  const token = await getCrawl4AiToken()
  const response = await fetch('http://gai-crawl4ai:11235/crawl/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token.access_token}`,
    },
    body: JSON.stringify({
      urls: [url],
      crawler_config: {
        type: 'CrawlerRunConfig',
        params: {
          stream: true,
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
    }),
  })

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('Failed to get response body reader')
  }

  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }

    const chunk = new TextDecoder().decode(value)
    chunk
      .trim()
      .split('\n')
      .forEach((line) => {
        if (!line) return
        try {
          //const obj = JSON.parse(line)
          console.log('Parsed object:', line)
        } catch (e) {
          console.error('Error parsing stream line:', e)
        }
      })
  }
  yield `Finished crawling ${url}`
}

//   const data = result.data as ApiResponse | undefined

//   if (!data?.success) {
//     throw new Error('Crawl failed', {
//       cause: data,
//     })
//   }

//   const filesWithoutContent = data.results.filter((result) => !result.markdown?.raw_markdown)
//   const filesWithContent = data.results.filter((result) => result.markdown?.raw_markdown)

//   if (filesWithoutContent.length > 0) {
//     console.warn('Crawl Warning', 'Some files do not have content', filesWithoutContent)
//   }

//   return filesWithContent.map((file) => ({
//     url: file.url,
//     content: file.markdown.raw_markdown,
//     title: file.metadata.title,
//   }))
// }
