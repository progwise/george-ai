import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { crawlHtmlStream } from '@george-ai/html-crawler'

import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

const saveHttpCrawlerFile = async ({
  workspaceId,
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  markdown,
}: {
  workspaceId: string
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  markdown: string
}) => {
  const crawlerUniqueKey = { crawledByCrawlerId_originUri: { crawledByCrawlerId: crawlerId, originUri: fileUri } }

  const dbFileInfo = await prisma.aiLibraryFile.upsert({
    where: crawlerUniqueKey,
    create: {
      name: fileName,
      mimeType: 'text/markdown',
      libraryId,
      originUri: fileUri,
      crawledByCrawlerId: crawlerId,
    },
    update: {}, // Don't update on find - we'll update after hash comparison
    select: { id: true, name: true, originUri: true, mimeType: true, originFileHash: true },
  })

  const existingManifest = await workspaceStorage.getFile(workspaceId, { libraryId, fileId: dbFileInfo.id })
  const hashBefore = existingManifest?.sourceHash

  const newManifest = await workspaceStorage.writeSource(workspaceId, {
    libraryId,
    fileId: dbFileInfo.id,
    stream: (async function* () {
      yield markdown
    })(),
    meta: {
      mimeType: 'text/markdown',
      originalName: fileName,
      originalUpdatedAt: new Date().toISOString(),
      originalContentHash: null,
    },
  })

  const hashAfter = newManifest.sourceHash
  const contentChanged = hashBefore !== hashAfter
  const isUpdate = !!hashBefore && contentChanged

  if (contentChanged) {
    await prisma.aiLibraryFile.update({
      where: { id: dbFileInfo.id },
      data: {
        originFileHash: hashAfter,
        size: Buffer.byteLength(markdown, 'utf8'),
      },
    })
  }

  return {
    ...dbFileInfo,
    skipProcessing: !contentChanged,
    wasUpdated: isUpdate,
  }
}

export async function* crawlHttp({
  workspaceId,
  uri,
  maxDepth,
  maxPages,
  libraryId,
  crawlerId,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start HTTP crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)

  try {
    for await (const result of crawlHtmlStream(uri, { maxDepth, maxPages })) {
      const fileInfo = await saveHttpCrawlerFile({
        workspaceId,
        fileName: result.title || 'No title',
        fileUri: result.url || uri,
        libraryId,
        crawlerId,
        markdown: result.markdown || 'No Markdown crawled from HTTP Crawler',
      })

      if (fileInfo.skipProcessing) {
        console.log(`Skipping HTTP page ${result.url} - content unchanged`)
        yield {
          id: fileInfo.id,
          name: fileInfo.name,
          originUri: fileInfo.originUri,
          mimeType: fileInfo.mimeType,
          skipProcessing: true,
          hints: `HTTP Crawler - page ${fileInfo.name} skipped (content unchanged)`,
        }
      } else {
        yield {
          id: fileInfo.id,
          name: fileInfo.name,
          originUri: fileInfo.originUri,
          mimeType: fileInfo.mimeType,
          skipProcessing: false,
          wasUpdated: fileInfo.wasUpdated,
          hints: `HTTP Crawler ${crawlerId} ${fileInfo.wasUpdated ? 'updated' : 'created'} page ${fileInfo.name}`,
        }
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? `${error.message}${error.cause ? ' ' + error.cause : ''}` : String(error)
    console.error('Error in HTTP crawler:', errorMessage)
    yield { errorMessage }
  }

  console.log(`Finished HTTP crawling ${uri}`)
}
