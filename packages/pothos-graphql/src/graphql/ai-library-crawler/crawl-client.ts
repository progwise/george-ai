export const CRAWL4AI_BASE_URL = 'http://gai-crawl4ai:11245'

// Uncomment the line below to use the local development server
// export const CRAWL4AI_BASE_URL = 'http://host.docker.internal:8000'

interface CrawlOptions {
  url: string
  maxDepth: number
  maxPages: number
}

export async function* crawl({ url, maxDepth, maxPages }: CrawlOptions) {
  console.log(`start crawling ${url}`)

  try {
    const encodedUrl = url
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      console.log(`Crawl request for ${url} timed out after 5 seconds`)
      controller.abort()
    }, 5000) // 60 seconds timeout
    const response = await fetch(
      `${CRAWL4AI_BASE_URL}/crawl?url=${encodedUrl}&maxDepth=${maxDepth}&maxPages=${maxPages}`,
      {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/jsonl',
        },
      },
    )
    if (!response.ok) {
      console.error(`Failed to start crawl ${url}:`, response.statusText)
      throw new Error(`Failed to start crawl ${url}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Failed to get response body reader')
    }
    clearTimeout(timeoutId)

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
  } catch (error) {
    const errorMessage = error instanceof Error ? `${error.message} ${error.cause}` : String(error)
    console.error('Error in crawl client:', errorMessage)
    yield { url, markdown: null, metaData: null, error: errorMessage }
  }
  console.log(`finished crawling ${url}`)
}
