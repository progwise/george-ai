import { openApiClient } from './fetchClient'

interface CrawlOptions {
  url: string
  maxDepth: number
  maxPages: number
}

export async function* crawl({ url, maxDepth, maxPages }: CrawlOptions) {
  console.log(`start crawling ${url}`)

  const encodedUrl = encodeURIComponent(url)
  const result = await openApiClient.GET('/crawl', {
    params: {
      query: {
        url: encodedUrl,
        maxDepth,
        maxPages,
      },
    },
  })

  if (result.error) {
    console.error(`Failed to start crawl ${url}:`, result.error)
    return
  }

  if (result.response.body === null) {
    console.error(`Failed to start crawl ${url} because there is no body.`)
    return
  }

  const reader = result.response.body.getReader()
  if (!reader) {
    throw new Error('Failed to get response body reader')
  }

  let readMode: 'read-metadata' | 'read-markdown' | null = null
  let currentMetadata: string | null = null
  let currentMarkdown: string | null = null
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      console.log('Stream finished')
      break
    }

    const textValue = new TextDecoder('utf-8').decode(value, { stream: true })
    const lines = textValue.split('\n').filter((line) => line.trim() !== '')
    if (lines.length === 0) {
      console.log('No lines in stream')
      continue
    }

    for (const line of lines) {
      if (line.startsWith('---BEGIN CRAWLER RESULT---')) {
        readMode = 'read-metadata'
        currentMetadata = null
        currentMarkdown = null
      } else if (line.startsWith('---END CRAWLER RESULT---')) {
        yield { metaData: currentMetadata, markdown: currentMarkdown }
        readMode = null
        currentMetadata = null
        currentMarkdown = null
      } else if (line.startsWith('---BEGIN MARKDOWN---')) {
        readMode = 'read-markdown'
        currentMarkdown = null
      } else {
        if (readMode === 'read-metadata') {
          if (currentMetadata) {
            currentMetadata += '\n' + line
          } else {
            currentMetadata = line
          }
        } else if (readMode === 'read-markdown') {
          if (currentMarkdown) {
            currentMarkdown += '\n' + line
          } else {
            currentMarkdown = line
          }
        }
      }
    }
  }
}
