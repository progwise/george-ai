import crypto from 'node:crypto'

import { type ApiCrawlerConfig, crawlApiStream } from '@george-ai/api-crawler'
import { workspaceStorage } from '@george-ai/file-management'

import { prisma } from '../../../../app-database/src'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

export async function* crawlApi({
  workspaceId,
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
          workspaceId,
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
  workspaceId,
  fileName,
  markdownContent,
  libraryId,
  crawlerId,
  originUri,
}: {
  workspaceId: string
  fileName: string
  markdownContent: string
  libraryId: string
  crawlerId: string
  originUri: string
}) => {
  const contentHash = crypto.createHash('sha256').update(markdownContent, 'utf8').digest('hex')
  const crawlerUniqueKey = { crawledByCrawlerId_originUri: { crawledByCrawlerId: crawlerId, originUri } }

  // Check if file already exists with the same originUri
  const existingFile = await prisma.aiLibraryFile.findUnique({
    where: crawlerUniqueKey,
    select: { id: true, name: true, originUri: true, mimeType: true, originFileHash: true },
  })

  // Skip processing if content unchanged
  if (existingFile?.originFileHash === contentHash) {
    await prisma.aiLibraryFile.update({
      where: { id: existingFile.id },
      data: { updatedAt: new Date() },
    })
    return { ...existingFile, skipProcessing: true, wasUpdated: false }
  }

  const wasUpdated = !!existingFile
  const now = new Date()

  const file = await prisma.aiLibraryFile.upsert({
    where: crawlerUniqueKey,
    create: {
      name: fileName,
      mimeType: 'text/markdown',
      libraryId,
      size: Buffer.byteLength(markdownContent, 'utf8'),
      originFileHash: contentHash,
      originModificationDate: now,
      originUri,
      crawledByCrawlerId: crawlerId,
    },
    update: {
      name: fileName,
      mimeType: 'text/markdown',
      libraryId,
      size: Buffer.byteLength(markdownContent, 'utf8'),
      originFileHash: contentHash,
      originModificationDate: now,
    },
  })

  await workspaceStorage.writeSource(workspaceId, {
    libraryId,
    fileId: file.id,
    stream: (async function* () {
      yield markdownContent
    })(),
    meta: {
      mimeType: 'text/markdown',
      originalName: fileName,
      originalUpdatedAt: now.toISOString(),
      originalContentHash: contentHash,
    },
  })

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    mimeType: file.mimeType,
    skipProcessing: false,
    wasUpdated,
  }
}
