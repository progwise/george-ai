import fs from 'node:fs'

import { type ApiCrawlerConfig, crawlApi as crawlApiPackage } from '@george-ai/api-crawler'
import { getUploadFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

interface ApiCrawlOptions extends CrawlOptions {
  crawlerConfig: ApiCrawlerConfig
}

const saveApiCrawlerFile = async ({
  fileName,
  content,
  libraryId,
  crawlerId,
  metadata,
}: {
  fileName: string
  content: string
  libraryId: string
  crawlerId: string
  metadata: Record<string, unknown>
}) => {
  const originUri = (metadata.url as string | undefined) || fileName

  const fileUpdateData = {
    name: fileName,
    mimeType: 'text/markdown',
    libraryId,
  }

  const file = await prisma.aiLibraryFile.upsert({
    where: {
      crawledByCrawlerId_originUri: {
        crawledByCrawlerId: crawlerId,
        originUri,
      },
    },
    create: {
      ...fileUpdateData,
      originUri,
      crawledByCrawlerId: crawlerId,
    },
    update: fileUpdateData,
  })

  const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
  await fs.promises.writeFile(uploadedFilePath, content)

  return file
}

export async function* crawlApi({
  libraryId,
  crawlerId,
  crawlerConfig,
}: ApiCrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start API crawling for crawler ${crawlerId}`)

  try {
    if (!crawlerConfig) {
      throw new Error('Missing crawlerConfig for API crawler')
    }

    // Validate config is ApiCrawlerConfig type
    const config = crawlerConfig as ApiCrawlerConfig

    if (!config.baseUrl || !config.endpoint) {
      throw new Error('Invalid API crawler config: missing baseUrl or endpoint')
    }

    console.log(`Crawling API: ${config.baseUrl}${config.endpoint}`)

    const result = await crawlApiPackage(config)

    if (!result.success) {
      throw new Error(result.error || 'API crawl failed')
    }

    console.log(`API crawl returned ${result.items.length} items`)

    for (const item of result.items) {
      try {
        const fileName = item.title || 'Untitled'
        const content = item.content || ''

        const file = await saveApiCrawlerFile({
          fileName,
          content,
          libraryId,
          crawlerId,
          metadata: item.metadata,
        })

        yield {
          ...file,
          hints: `API Crawler ${crawlerId} successfully crawled item ${file.id}`,
        }

        console.log(`Successfully saved API crawled item: ${fileName}`)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error saving API crawled item:`, errorMessage)
        yield {
          errorMessage: `Failed to save item "${item.title}": ${errorMessage}`,
        }
      }
    }

    console.log(`Finished API crawling for crawler ${crawlerId}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in API crawler:', errorMessage)
    yield { errorMessage }
  }
}
