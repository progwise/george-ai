import { ApiCrawlerConfigSchema, crawlApiStream } from '@george-ai/api-crawler'

import { logger, saveCrawlerFile } from './common'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

export async function* crawlApi(parameters: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  const { workspaceId, libraryId, crawlerId, crawlerConfig, maxPages } = parameters

  // TODO: Make logger safe because crawlerConfig may contain sensitive info
  const loggedParameters = { parameters: { ...parameters, crawlerConfig: 'REDACTED' } }
  logger.info('Start API crawling for crawler', loggedParameters)

  try {
    if (!crawlerConfig) {
      logger.error('Missing crawlerConfig for API crawler', loggedParameters)
      throw new Error('Missing crawlerConfig for API crawler')
    }

    // Validate config is ApiCrawlerConfig type
    const config = ApiCrawlerConfigSchema.parse(crawlerConfig)

    if (!config.baseUrl || !config.endpoint) {
      logger.error('Invalid API crawler config: missing baseUrl or endpoint', loggedParameters)
      throw new Error('Invalid API crawler config: missing baseUrl or endpoint')
    }

    let itemCount = 0
    let skippedCount = 0
    let updatedCount = 0
    let newCount = 0

    // Stream items as they are fetched
    for await (const item of crawlApiStream(config)) {
      try {
        itemCount++
        if (itemCount > maxPages) {
          logger.debug('Reached maxPages limit, stopping crawl.', { maxPages, itemCount, ...loggedParameters })
          break
        }

        // Use provider-generated markdown content directly
        const markdown = item.content || `# ${item.title}\n\nNo content available`
        const content = Buffer.from(markdown, 'utf-8')

        const safeFileName = item.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .slice(0, 50)
        const fileNameWithExt = `${safeFileName || 'api_item_' + itemCount}.md`

        logger.debug('Processing API crawled item ', {
          title: item.title,
          originUri: item.originUri,
          markdownPreview: markdown.slice(0, 100),
          fileNameWithExt,
          ...loggedParameters,
        })

        const fileResult = await saveCrawlerFile({
          workspaceId,
          fileName: fileNameWithExt,
          mimeType: 'text/markdown',
          content,
          libraryId,
          crawlerId,
          fileUri: item.originUri,
        })

        // Track statistics
        if (fileResult.skipProcessing) {
          skippedCount++
          logger.debug('Skipping API item - content unchanged', { title: item.title, ...loggedParameters })

          yield {
            id: fileResult.fileId,
            name: fileResult.fileName,
            originUri: fileResult.originUri,
            mimeType: fileResult.mimeType,
            skipProcessing: true,
            hints: `API Crawler - item ${fileResult.fileName} skipped (content unchanged)`,
          }
        } else {
          if (fileResult.wasUpdated) {
            updatedCount++
            logger.debug('Updated API item', { itemCount, fileNameWithExt, ...loggedParameters })
          } else {
            newCount++
            logger.debug('Created new API item', { itemCount, fileNameWithExt, ...loggedParameters })
          }

          yield {
            id: fileResult.fileId,
            name: fileResult.fileName,
            originUri: fileResult.originUri,
            mimeType: fileResult.mimeType,
            skipProcessing: false,
            wasUpdated: fileResult.wasUpdated,
            hints: `API Crawler ${crawlerId} ${fileResult.wasUpdated ? 'updated' : 'created'} item ${fileResult.fileName}`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error('Error saving API crawled item:', {
          errorMessage,
          title: item.title,
          originUri: item.originUri,
          ...loggedParameters,
        })
        yield {
          errorMessage: `Failed to save item "${item.title}": ${errorMessage}`,
        }
      }
    }

    logger.info('Finished API crawling for crawler', {
      itemCount,
      skippedCount,
      updatedCount,
      newCount,
      ...loggedParameters,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Error in API crawler:', { errorMessage, ...loggedParameters })
    yield { errorMessage }
  }
}
