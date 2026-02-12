import { getMimeTypeFromExtension } from '@george-ai/app-commons'

import { isFileSizeAcceptable } from '../../file/constants'
import { FileInfo, applyFileFilters } from '../../file/file-filter'
import { logger, saveCrawlerFile } from '../common'
import { recordOmittedFile } from '../common/record-omitted-file'
import { CrawledFileInfo } from '../crawled-file-info'
import { getCrawlerCredentials } from '../crawler-credentials-manager'
import { CrawlOptions } from '../crawler-options'
import { downloadBoxFile } from './box-api'
import { discoverBoxFilesStreaming } from './discover-files'

export async function* crawlBox(options: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  const { workspaceId, uri, maxDepth, maxPages, crawlerId, libraryId, crawlerRunId, filterConfig } = options
  logger.info('Start Box crawling', options)

  // Get Box credentials from stored credentials
  const credentials = await getCrawlerCredentials(crawlerId)
  const accessToken = credentials['boxToken'] as string

  if (!accessToken) {
    const errorMessage = 'Box access token not found in crawler credentials'
    logger.error(errorMessage, options)
    yield { errorMessage }
    return
  }

  // Parse the Box URI to extract folder ID
  // Expected formats:
  // - box://0 (root folder)
  // - box://123456789 (specific folder ID)
  // - https://app.box.com/folder/123456789
  let folderId: string
  if (uri.startsWith('box://')) {
    folderId = uri.replace('box://', '')
  } else if (uri.includes('box.com/folder/')) {
    const match = uri.match(/box\.com\/folder\/(\d+)/)
    folderId = match?.[1] || '0'
  } else {
    folderId = '0' // Default to root
  }

  let processedPages = 0

  try {
    // Process files as they're discovered - yields immediately
    for await (const fileToProcess of discoverBoxFilesStreaming(folderId, '', 0, maxDepth, accessToken)) {
      if (processedPages >= maxPages) {
        logger.info('Reached maxPages limit', { processedPages, maxPages })
        break
      }

      processedPages++

      try {
        logger.debug('Processing Box file', { name: fileToProcess.name, id: fileToProcess.id })

        const mimeType = getMimeTypeFromExtension(fileToProcess.name)
        // Use Box web app URL format for browser access
        const fileUri = `https://app.box.com/file/${fileToProcess.id}`

        // Apply file filters if configured
        if (filterConfig) {
          const fileInfo: FileInfo = {
            fileName: fileToProcess.name,
            filePath: fileUri,
            fileSize: fileToProcess.size,
            modificationDate: fileToProcess.modifiedTime,
          }

          const filterResult = applyFileFilters(fileInfo, filterConfig)
          if (!filterResult.allowed) {
            logger.info('Box file filtered out', { fileUri, reason: filterResult.reason })

            // Record the omitted file
            await recordOmittedFile({
              libraryId,
              crawlerRunId,
              filePath: fileUri,
              fileName: fileToProcess.name,
              fileSize: fileToProcess.size,
              reason: filterResult.reason || 'File filtered',
              filterType: filterResult.filterType || 'unknown',
              filterValue: filterResult.filterValue,
            })

            // Skip this file but continue processing others
            continue
          }
        }

        // Check file size limits before downloading
        const sizeCheck = isFileSizeAcceptable(fileToProcess.size)

        if (!sizeCheck.acceptable) {
          logger.warn('Box file skipped due to size limit', {
            fileUri,
            size: fileToProcess.size,
            reason: sizeCheck.reason,
          })
          continue
        }

        if (sizeCheck.shouldWarn) {
          logger.warn('Box file', { fileUri, size: fileToProcess.size, reason: sizeCheck.reason })
        }

        // Download file content
        const content = await downloadBoxFile(fileToProcess.id, accessToken)

        const fileInfo = await saveCrawlerFile({
          workspaceId,
          fileName: fileToProcess.name,
          crawlerId,
          libraryId,
          modificationDate: fileToProcess.modifiedTime,
          mimeType,
          fileUri,
          content,
        })

        // Check if we should skip processing
        if (fileInfo.skipProcessing) {
          logger.info('Skipping processing for Box file - file unchanged', { fileName: fileToProcess.name })

          const fileSizeMB = (fileToProcess.size / (1024 * 1024)).toFixed(2)
          const skipHints = [
            `Box crawler - file ${fileInfo.fileName} skipped (already processed with same hash)`,
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
          yield {
            id: fileInfo.fileId,
            name: fileInfo.fileName,
            originUri: fileInfo.originUri,
            mimeType: fileInfo.mimeType,
            skipProcessing: false,
            wasUpdated: fileInfo.wasUpdated,
            downloadUrl: fileUri, // Browser-accessible Box URL
            hints: `Box Crawler ${crawlerId} for file ${fileInfo.fileName}`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const hints = `Error processing Box file ${fileToProcess.name} (ID: ${fileToProcess.id}) in crawler ${crawlerId}`
        logger.error(hints, { errorMessage })
        yield { errorMessage, hints }
      }
    }

    logger.info('Finished Box crawling', { processedPages })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error in Box crawler ${crawlerId}`
    logger.error(hints, { errorMessage })
    yield { errorMessage, hints }
  }
}
