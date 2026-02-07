import { SmbCrawlerClient, SmbFileMetadataSchema } from '@george-ai/smb-crawler-client'

import config from '../../../config'
import { MAX_FILE_SIZE, isFileSizeAcceptable } from '../../file/constants'
import { FileInfo, applyFileFilters } from '../../file/file-filter'
import { logger, recordOmittedFile } from '../common'
import { CrawledFileInfo } from '../crawled-file-info'
import { CrawlOptions } from '../crawler-options'
import { saveSmbCrawlerFile } from './save-smb-crawler-file'

export async function* crawlSmb(parameters: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  const { workspaceId, uri, credentials, maxDepth, maxPages, libraryId, crawlerId, crawlerRunId, filterConfig } =
    parameters
  const smbCrawlerUrl = config('SMB_CRAWLER_URL')
  logger.info('Start SMB crawling', { parameters, smbCrawlerUrl })

  if (!credentials?.username || !credentials?.password) {
    const errorMessage = 'SMB credentials (username/password) are required'
    logger.error(errorMessage, { parameters })
    yield { errorMessage, hints: 'Missing SMB credentials' }
    return
  }

  let processedPages = 0
  const client = new SmbCrawlerClient({ baseUrl: smbCrawlerUrl })

  let jobId: string
  let streamUrl: string

  try {
    const result = await client.startCrawl({
      uri,
      username: credentials.username,
      password: credentials.password,
      maxDepth,
      maxFileSizeBytes: MAX_FILE_SIZE,
      // Note: File filtering will be done in backend, not in crawler service
      // The crawler service discovers all files and we filter them here
    })
    jobId = result.jobId
    streamUrl = result.streamUrl
  } catch (error) {
    // Connection/mount errors should fail the entire run (not just create error updates)
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('Failed to start SMB crawl', { errorMessage, uri, parameters })
    // Re-throw the original error to fail the run
    throw error
  }

  logger.info('Started SMB crawl job', { jobId, streamUrl, parameters })

  try {
    // Stream events from crawler service
    for await (const event of client.streamCrawl(jobId)) {
      if (processedPages >= maxPages) {
        logger.info('Reached maxPages limit, stopping crawl.', { maxPages, processedPages, parameters, jobId })
        await client.cancelCrawl(jobId)
        break
      }

      if (event.type === 'file-found') {
        processedPages++

        try {
          const fileMetadata = SmbFileMetadataSchema.parse(event.data)

          // Build full URI for the file
          const fileUri = `${uri}${uri.endsWith('/') ? '' : '/'}${fileMetadata.relativePath}`
          logger.debug('Processing SMB file', { fileMetadata, fileUri, parameters })

          // Apply file filters if configured
          if (filterConfig) {
            const fileInfo: FileInfo = {
              fileName: fileMetadata.name,
              filePath: fileUri,
              fileSize: fileMetadata.size,
              modificationDate: fileMetadata.lastModified,
            }

            const filterResult = applyFileFilters(fileInfo, filterConfig)
            if (!filterResult.allowed) {
              logger.debug('SMB file filtered out', { fileUri, filterResult, parameters })

              // Record the omitted file
              await recordOmittedFile({
                libraryId,
                crawlerRunId,
                filePath: fileUri,
                fileName: fileMetadata.name,
                fileSize: fileMetadata.size,
                reason: filterResult.reason || 'File filtered',
                filterType: filterResult.filterType || 'unknown',
                filterValue: filterResult.filterValue,
              })

              // Skip this file but continue processing others
              continue
            }
          }

          // Check file size limits before processing
          const sizeCheck = isFileSizeAcceptable(fileMetadata.size)

          if (!sizeCheck.acceptable) {
            logger.warn('SMB file too large', { fileUri, sizeCheck, parameters })
            await recordOmittedFile({
              libraryId,
              crawlerRunId,
              filePath: fileUri,
              fileName: fileMetadata.name,
              fileSize: fileMetadata.size,
              reason: sizeCheck.reason || 'File size exceeds limit',
              filterType: 'size',
              filterValue: sizeCheck.reason,
            })
            continue
          }

          if (sizeCheck.shouldWarn) {
            logger.warn('SMB file size check warning', { fileUri, sizeCheck, parameters })
          }

          const fileInfo = await saveSmbCrawlerFile({
            workspaceId,
            fileName: fileMetadata.name,
            crawlerId,
            libraryId,
            modificationDate: fileMetadata.lastModified,
            mimeType: fileMetadata.mimeType || 'application/octet-stream',
            fileUri,
            jobId,
            fileId: fileMetadata.fileId,
            client,
          })

          // Check if we should skip processing
          if (fileInfo.skipProcessing) {
            logger.info('Skipping processing for SMB file - file unchanged', {
              fileMetadata,
              fileUri,
              jobId,
              parameters,
            })

            const fileSizeMB = (fileMetadata.size / (1024 * 1024)).toFixed(2)
            const skipHints = [
              `SMB crawler - file ${fileInfo.fileName} skipped (already processed with same hash)`,
              `Size: ${fileSizeMB} MB`,
              `Origin: ${fileUri}`,
            ].join(' | ')

            yield {
              id: fileInfo.fileId,
              name: fileInfo.fileName,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              skipProcessing: true,
              hints: skipHints,
            }
          } else {
            logger.debug('Processed SMB file', { fileMetadata, fileUri, jobId, parameters })
            yield {
              id: fileInfo.fileId,
              name: fileInfo.fileName,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              skipProcessing: false,
              wasUpdated: fileInfo.wasUpdated,
              hints: `SMB Crawler ${crawlerId} for file ${fileInfo.fileName}`,
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error('Error processing SMB file', { error, parameters, eventData: event.data, jobId })
          yield { errorMessage, hints: `Error processing SMB file in crawler ${crawlerId}` }
        }
      } else if (event.type === 'progress') {
        // Log progress updates
        logger.debug('SMB crawl progress', { event, parameters, jobId })
      } else if (event.type === 'complete') {
        logger.info('SMB crawl complete', { event, parameters, jobId })
      } else if (event.type === 'error') {
        const error = event.data
        const errorMessage = error.message
        const hints = `Error from SMB crawler service`
        logger.error(hints, { event, parameters, jobId })
        yield { errorMessage, hints }
      }
    }

    logger.info('Finished SMB crawling', { processedPages, jobId })

    // Clean up crawler job
    try {
      await client.cancelCrawl(jobId)
      logger.debug('Cleaned up crawler job', { jobId })
    } catch (error) {
      logger.warn('Failed to clean up SMB crawler job', {
        jobId,
        error: error instanceof Error ? error.message : String(error),
      })
    }
  } catch (error) {
    // Errors during streaming (file processing errors, etc.) are yielded as error updates
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error streaming from SMB crawler service`
    logger.error(hints, errorMessage)
    yield { errorMessage, hints }
  }
}
