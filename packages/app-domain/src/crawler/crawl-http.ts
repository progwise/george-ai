import { crawlHtmlStream } from '@george-ai/html-crawler-client'

import { saveCrawlerFile } from './common'
import { logger } from './common'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

export async function* crawlHttp(parameters: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  const { workspaceId, uri, maxDepth, maxPages, libraryId, crawlerId } = parameters
  logger.info('Start HTTP crawling', parameters)

  try {
    for await (const result of crawlHtmlStream(uri, { maxDepth, maxPages })) {
      const fileInfo = await saveCrawlerFile({
        workspaceId,
        fileName: result.title || 'No title',
        fileUri: result.url || uri,
        libraryId,
        crawlerId,
        content: Buffer.from(result.markdown),
        mimeType: 'text/markdown',
      })

      if (fileInfo.skipProcessing) {
        logger.debug('Skipping HTTP page', { url: result.url, reason: 'content unchanged', parameters })
        yield {
          id: fileInfo.fileId,
          name: fileInfo.fileName,
          originUri: fileInfo.originUri,
          mimeType: fileInfo.mimeType,
          skipProcessing: true,
          hints: `HTTP Crawler - page ${fileInfo.fileName} skipped (content unchanged)`,
        }
      } else {
        yield {
          id: fileInfo.fileId,
          name: fileInfo.fileName,
          originUri: fileInfo.originUri,
          mimeType: fileInfo.mimeType,
          skipProcessing: false,
          wasUpdated: fileInfo.wasUpdated,
          hints: `HTTP Crawler ${crawlerId} ${fileInfo.wasUpdated ? 'updated' : 'created'} page ${fileInfo.fileName}`,
        }
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? `${error.message}${error.cause ? ' ' + error.cause : ''}` : String(error)
    logger.error('Error in HTTP crawler:', { errorMessage, parameters })
    yield { errorMessage }
  }

  logger.info('Finished HTTP crawling', { uri, maxDepth, maxPages, parameters })
}
