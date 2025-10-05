import fs from 'node:fs'

import { getUploadFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

export const CRAWL4AI_BASE_URL = 'http://gai-crawl4ai:11245'

// Uncomment the line below to use the local development server
//export const CRAWL4AI_BASE_URL = 'http://host.docker.internal:8000'

const saveHttpCrawlerFile = async ({
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  markdown,
}: {
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  markdown: string
}) => {
  const fileUpdateData = {
    name: `${fileName}`,
    mimeType: 'text/markdown',
    libraryId: libraryId,
  }

  const file = await prisma.aiLibraryFile.upsert({
    where: {
      crawledByCrawlerId_originUri: {
        crawledByCrawlerId: crawlerId,
        originUri: fileUri,
      },
    },
    create: {
      ...fileUpdateData,
      originUri: fileUri,
      crawledByCrawlerId: crawlerId,
    },
    update: fileUpdateData,
  })

  const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
  await fs.promises.writeFile(uploadedFilePath, markdown)
  return file
}

export async function* crawlHttp({
  uri,
  maxDepth,
  maxPages,
  libraryId,
  crawlerId,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  // TODO: Implement HTTP crawler filtering logic
  // For now, HTTP crawler doesn't apply file filters (mainly used for SMB/file crawlers)
  console.log(`start http crawling ${uri}`)

  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  let controller: AbortController | undefined

  const url = new URL(uri)
  const encodedUrl = uri

  try {
    controller = new AbortController()

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

    reader = response.body?.getReader()
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
          if (!currentMetadata) {
            yield { errorMessage: 'Empty Metadata during HTTP crawl', hints: currentMetadata }
          } else {
            const metaData = JSON.parse(currentMetadata)
            const fileInfo = await saveHttpCrawlerFile({
              fileName: metaData.title || 'No title',
              fileUri: metaData.url || 'no url',
              libraryId,
              crawlerId,
              markdown: currentMarkdown || 'No Markdown crawled from HTTP Crawler',
            })
            yield { ...fileInfo, hints: `HTTP Crawler ${crawlerId} successfully crawled file ${fileInfo.id}` } //{ metaData: currentMetadata, markdown: currentMarkdown }
            readMode = null
            currentMetadata = null
            currentMarkdown = null
          }
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
    const errorMessage =
      error instanceof Error ? `${error.message}${error.cause ? ' ' + error.cause : ''}` : String(error)
    console.error('Error in crawl client:', errorMessage)
    yield { errorMessage: errorMessage }
  } finally {
    // Ensure we properly close the connection when the generator is terminated
    if (reader) {
      try {
        await reader.cancel()
        console.log(`Reader cancelled for ${url}`)
      } catch (err) {
        console.error(`Error cancelling reader for ${url}:`, err)
      }
    }
    if (controller && !controller.signal.aborted) {
      controller.abort()
      console.log(`Controller aborted for ${url}`)
    }
  }
  console.log(`finished crawling ${url}`)
}
