import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

import { type ApiCrawlerConfig, crawlApiStream } from '@george-ai/api-crawler'
import { getUploadFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

/**
 * Calculate SHA-256 hash of a string (for markdown content)
 */
function calculateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

export async function* crawlApi({
  libraryId,
  crawlerId,
  crawlerConfig,
  maxPages,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
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
    console.log(`API Config:`, JSON.stringify(config, null, 2))

    let itemCount = 0
    let skippedCount = 0
    let updatedCount = 0
    let newCount = 0

    // Stream items as they are fetched
    for await (const item of crawlApiStream(config)) {
      try {
        itemCount++
        if (itemCount > maxPages) {
          console.log(`Reached maxPages limit of ${maxPages}, stopping crawl.`)
          break
        }

        console.log(`Processing API crawled item ${itemCount}: ${item.title}`)

        // Use provider-generated markdown content directly
        const markdownContent = item.content || `# ${item.title}\n\nNo content available`

        const safeFileName = item.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .slice(0, 50)
        const fileNameWithExt = `${safeFileName || 'api_item_' + itemCount}.md`

        const fileResult = await saveApiCrawlerFile({
          fileName: fileNameWithExt,
          markdownContent,
          libraryId,
          crawlerId,
          originUri: item.originUri,
        })

        // Track statistics
        if (fileResult.skipProcessing) {
          skippedCount++
          console.log(`Skipping API item ${item.title} - content unchanged`)

          yield {
            id: fileResult.id,
            name: fileResult.name,
            originUri: fileResult.originUri,
            mimeType: fileResult.mimeType,
            skipProcessing: true,
            hints: `API Crawler - item ${fileResult.name} skipped (content unchanged)`,
          }
        } else {
          if (fileResult.wasUpdated) {
            updatedCount++
            console.log(`Updated API item ${itemCount}: ${fileNameWithExt}`)
          } else {
            newCount++
            console.log(`Created new API item ${itemCount}: ${fileNameWithExt}`)
          }

          yield {
            id: fileResult.id,
            name: fileResult.name,
            originUri: fileResult.originUri,
            mimeType: fileResult.mimeType,
            skipProcessing: false,
            wasUpdated: fileResult.wasUpdated,
            hints: `API Crawler ${crawlerId} ${fileResult.wasUpdated ? 'updated' : 'created'} item ${fileResult.name}`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(`Error saving API crawled item:`, errorMessage)
        yield {
          errorMessage: `Failed to save item "${item.title}": ${errorMessage}`,
        }
      }
    }

    console.log(
      `Finished API crawling for crawler ${crawlerId}. Total: ${itemCount}, New: ${newCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`,
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error in API crawler:', errorMessage)
    yield { errorMessage }
  }
}

const saveApiCrawlerFile = async ({
  fileName,
  markdownContent,
  libraryId,
  crawlerId,
  originUri,
}: {
  fileName: string
  markdownContent: string
  libraryId: string
  crawlerId: string
  originUri: string
}) => {
  // Calculate hash of the markdown content
  const contentHash = calculateContentHash(markdownContent)

  // Check if file already exists with the same originUri
  const existingFile = await prisma.aiLibraryFile.findUnique({
    where: {
      crawledByCrawlerId_originUri: {
        crawledByCrawlerId: crawlerId,
        originUri,
      },
    },
    select: {
      id: true,
      name: true,
      originUri: true,
      mimeType: true,
      originFileHash: true,
    },
  })

  // If file exists and hash matches, skip processing
  if (existingFile && existingFile.originFileHash === contentHash) {
    // Update the updatedAt timestamp even when skipping
    await prisma.aiLibraryFile.update({
      where: { id: existingFile.id },
      data: { updatedAt: new Date() },
    })

    return {
      ...existingFile,
      skipProcessing: true,
      wasUpdated: false,
    }
  }

  // Determine if this is an update or new file
  // Treat missing hash (from old crawls before hashing was implemented) as an update
  const wasUpdated = !!existingFile && (!existingFile.originFileHash || existingFile.originFileHash !== contentHash)

  const fileUpdateData = {
    name: fileName,
    mimeType: 'text/markdown',
    libraryId,
    size: Buffer.byteLength(markdownContent, 'utf8'),
    originFileHash: contentHash,
    originModificationDate: new Date(),
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

  // Write the file to disk
  const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
  await fs.promises.mkdir(path.dirname(uploadedFilePath), { recursive: true })
  await fs.promises.writeFile(uploadedFilePath, markdownContent, 'utf8')

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    mimeType: file.mimeType,
    skipProcessing: false,
    wasUpdated,
  }
}
