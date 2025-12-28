import fs from 'node:fs'

import { prisma } from '@george-ai/app-domain'
import { getUploadFilePath } from '@george-ai/file-management'
import { crawlHtmlStream } from '@george-ai/html-crawler'

import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

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

  try {
    for await (const result of crawlHtmlStream(uri, { maxDepth, maxPages })) {
      const fileInfo = await saveHttpCrawlerFile({
        fileName: result.title || 'No title',
        fileUri: result.url || uri,
        libraryId,
        crawlerId,
        markdown: result.markdown || 'No Markdown crawled from HTTP Crawler',
      })
      yield { ...fileInfo, hints: `HTTP Crawler ${crawlerId} successfully crawled file ${fileInfo.id}` }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? `${error.message}${error.cause ? ' ' + error.cause : ''}` : String(error)
    console.error('Error in crawl client:', errorMessage)
    yield { errorMessage: errorMessage }
  }

  console.log(`finished crawling ${uri}`)
}
