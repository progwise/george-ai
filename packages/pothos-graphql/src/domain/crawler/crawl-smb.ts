import { Readable } from 'node:stream'

import { createLogger } from '@george-ai/app-commons'
import { workspaceStorage } from '@george-ai/file-management'
import { SmbCrawlerClient } from '@george-ai/smb-crawler'
import type { SmbFileMetadata } from '@george-ai/smb-crawler'

import { prisma } from '../../../../app-database/src'
import { SMB_CRAWLER_URL } from '../../global-config'
import { isFileSizeAcceptable } from '../file/constants'
import { FileInfo, applyFileFilters } from '../file/file-filter'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'

// Logger instance
const logger = createLogger('SMB Crawler')

const recordOmittedFile = async ({
  libraryId,
  crawlerRunId,
  filePath,
  fileName,
  fileSize,
  reason,
  filterType,
  filterValue,
}: {
  libraryId: string
  crawlerRunId?: string
  filePath: string
  fileName: string
  fileSize?: number | string
  reason: string
  filterType: string
  filterValue?: string
}) => {
  // Check if the file already exists in the database
  const existingFile = await prisma.aiLibraryFile.findFirst({
    where: {
      libraryId,
      originUri: filePath,
      archivedAt: null, // Only consider non-archived files
    },
  })

  // If the file exists, mark it as archived
  if (existingFile) {
    await prisma.aiLibraryFile.update({
      where: { id: existingFile.id },
      data: { archivedAt: new Date() },
    })
  }

  await prisma.aiLibraryUpdate.create({
    data: {
      libraryId,
      crawlerRunId,
      fileId: existingFile?.id || null,
      message: reason,
      updateType: 'omitted',
      filePath,
      fileName,
      fileSize: typeof fileSize === 'string' ? parseInt(fileSize, 10) : fileSize,
      filterType,
      filterValue,
    },
  })
}

const saveSmbCrawlerFile = async ({
  workspaceId,
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  mimeType,
  fileSize,
  fileModifiedTime,
  fileHash,
  jobId,
  fileId,
  client,
  processingError,
}: {
  workspaceId: string
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  mimeType: string
  fileSize: number
  fileModifiedTime: Date
  fileHash: string
  jobId: string
  fileId: string
  client: SmbCrawlerClient
  processingError?: string
}) => {
  // Handle error cases before DB operations
  if (processingError) {
    logger.warn(`SMB file ${fileName}: ${processingError}`)
    return { id: undefined, name: fileName, originUri: fileUri, mimeType, skipProcessing: false, wasUpdated: false }
  }

  const crawlerUniqueKey = { crawledByCrawlerId_originUri: { crawledByCrawlerId: crawlerId, originUri: fileUri } }

  // Check if file already exists with same hash (SMB service provides hash upfront)
  const existingFile = await prisma.aiLibraryFile.findUnique({
    where: crawlerUniqueKey,
    select: { id: true, name: true, originUri: true, mimeType: true, originFileHash: true },
  })

  // Skip if hash unchanged - no need to download
  if (existingFile?.originFileHash === fileHash) {
    logger.info(`Skipping SMB file ${fileName} - already processed with same hash`)
    await prisma.aiLibraryFile.update({
      where: { id: existingFile.id },
      data: { originModificationDate: fileModifiedTime, updatedAt: new Date() },
    })
    return { ...existingFile, skipProcessing: true, wasUpdated: false }
  }

  const isUpdate = !!existingFile

  // Create/update DB record
  const dbFileInfo = await prisma.aiLibraryFile.upsert({
    where: crawlerUniqueKey,
    create: {
      name: fileName,
      libraryId,
      mimeType,
      size: fileSize,
      originUri: fileUri,
      crawledByCrawlerId: crawlerId,
      originModificationDate: fileModifiedTime,
      originFileHash: fileHash,
    },
    update: {
      name: fileName,
      mimeType,
      size: fileSize,
      originModificationDate: fileModifiedTime,
      originFileHash: fileHash,
    },
    select: { id: true, name: true, originUri: true, mimeType: true },
  })

  // Download file from crawler service
  logger.info(`Downloading file ${fileName} from crawler service...`)
  const webStream = await client.downloadFile(jobId, fileId)

  // Convert web ReadableStream to Node.js Readable
  const reader = webStream.getReader()
  const nodeStream = new Readable({
    async read() {
      const { done, value } = await reader.read()
      if (done) {
        this.push(null)
      } else {
        this.push(Buffer.from(value))
      }
    },
  })

  // Write to storage
  await workspaceStorage.writeSource(workspaceId, {
    libraryId,
    fileId: dbFileInfo.id,
    stream: nodeStream,
    meta: {
      mimeType,
      originalName: fileName,
      originalUpdatedAt: fileModifiedTime.toISOString(),
      originalContentHash: fileHash,
    },
  })

  logger.debug(`File ${fileName} saved to storage`)

  return {
    ...dbFileInfo,
    skipProcessing: false,
    wasUpdated: isUpdate,
  }
}

export async function* crawlSmb({
  workspaceId,
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
  crawlerRunId,
  filterConfig,
  credentials,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  logger.info(`Start SMB crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)
  logger.info(`Using SMB crawler service at: ${SMB_CRAWLER_URL}`)

  if (!SMB_CRAWLER_URL) {
    const errorMessage = 'SMB_CRAWLER_URL is not configured'
    logger.error(errorMessage)
    yield { errorMessage, hints: 'Missing SMB_CRAWLER_URL configuration' }
    return
  }

  if (!credentials?.username || !credentials?.password) {
    const errorMessage = 'SMB credentials (username/password) are required'
    logger.error(errorMessage)
    yield { errorMessage, hints: 'Missing SMB credentials' }
    return
  }

  let processedPages = 0
  const client = new SmbCrawlerClient({ baseUrl: SMB_CRAWLER_URL })

  // Start crawl job on SMB crawler service
  // If this fails (authentication, network, mount errors, etc.), throw to fail the entire run
  logger.info(`Starting crawl job on SMB crawler service...`)
  let jobId: string
  let streamUrl: string

  try {
    const result = await client.startCrawl({
      uri,
      username: credentials.username,
      password: credentials.password,
      // Note: File filtering will be done in backend, not in crawler service
      // The crawler service discovers all files and we filter them here
    })
    jobId = result.jobId
    streamUrl = result.streamUrl
  } catch (error) {
    // Connection/mount errors should fail the entire run (not just create error updates)
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error(`Failed to start SMB crawler: ${errorMessage}`)
    // Re-throw the original error to fail the run
    throw error
  }

  logger.info(`Crawl job started: ${jobId}, stream URL: ${streamUrl}`)

  try {
    // Stream events from crawler service
    for await (const event of client.streamCrawl(jobId)) {
      if (processedPages >= maxPages) {
        logger.info(`Reached max pages limit (${maxPages}), stopping crawl`)
        await client.cancelCrawl(jobId)
        break
      }

      if (event.type === 'file-found') {
        processedPages++
        const fileMetadata = event.data as SmbFileMetadata

        try {
          logger.debug(`Processing SMB file: ${fileMetadata.relativePath}`)

          // Build full URI for the file
          const fileUri = `${uri}${uri.endsWith('/') ? '' : '/'}${fileMetadata.relativePath}`

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
              logger.debug(`SMB file filtered out: ${fileUri} - ${filterResult.reason}`)

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
            logger.warn(`SMB file too large ${fileUri}: ${sizeCheck.reason}`)

            // Still create file record but mark as failed due to size
            const fileInfo = await saveSmbCrawlerFile({
              workspaceId,
              fileName: fileMetadata.name,
              crawlerId,
              libraryId,
              fileModifiedTime: fileMetadata.lastModified,
              fileSize: fileMetadata.size,
              mimeType: fileMetadata.mimeType || 'application/octet-stream',
              fileUri,
              fileHash: fileMetadata.hash,
              jobId,
              fileId: fileMetadata.fileId,
              client,
              processingError: `File too large: ${sizeCheck.reason}`,
            })

            yield {
              id: fileInfo.id,
              name: fileInfo.name,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              skipProcessing: false,
              hints: `SMB Crawler ${crawlerId} - file ${fileInfo.name} skipped due to size limit`,
            }
            continue
          }

          if (sizeCheck.shouldWarn) {
            logger.warn(`SMB file ${fileUri}: ${sizeCheck.reason}`)
          }

          const fileInfo = await saveSmbCrawlerFile({
            workspaceId,
            fileName: fileMetadata.name,
            crawlerId,
            libraryId,
            fileModifiedTime: fileMetadata.lastModified,
            fileSize: fileMetadata.size,
            mimeType: fileMetadata.mimeType || 'application/octet-stream',
            fileUri,
            fileHash: fileMetadata.hash,
            jobId,
            fileId: fileMetadata.fileId,
            client,
          })

          // Check if we should skip processing
          if (fileInfo.skipProcessing) {
            logger.info(`Skipping processing for SMB file ${fileMetadata.name} - file unchanged`)

            const fileSizeMB = (fileMetadata.size / (1024 * 1024)).toFixed(2)
            const skipHints = [
              `SMB crawler - file ${fileInfo.name} skipped (already processed with same hash)`,
              `Size: ${fileSizeMB} MB`,
              `Origin: ${fileUri}`,
            ].join(' | ')

            yield {
              id: fileInfo.id,
              name: fileInfo.name,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              skipProcessing: true,
              hints: skipHints,
            }
          } else {
            yield {
              id: fileInfo.id,
              name: fileInfo.name,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              skipProcessing: false,
              wasUpdated: fileInfo.wasUpdated,
              hints: `SMB Crawler ${crawlerId} for file ${fileInfo.name}`,
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          const hints = `Error processing SMB file ${fileMetadata.relativePath} in crawler ${crawlerId}`
          logger.error(hints, errorMessage)
          yield { errorMessage, hints }
        }
      } else if (event.type === 'progress') {
        // Log progress updates
        const progress = event.data
        logger.debug(`SMB crawl progress: ${progress.filesMatched} files matched, ${progress.filesFound} total found`)
      } else if (event.type === 'complete') {
        const complete = event.data
        logger.info(`SMB crawl complete: ${complete.totalMatched} files in ${complete.durationMs}ms`)
      } else if (event.type === 'error') {
        const error = event.data
        const errorMessage = error.message
        const hints = `Error from SMB crawler service`
        logger.error(hints, errorMessage)
        yield { errorMessage, hints }
      }
    }

    logger.info(`Finished SMB crawling. Processed ${processedPages} files.`)

    // Clean up crawler job
    try {
      await client.cancelCrawl(jobId)
      logger.info(`Cleaned up crawler job ${jobId}`)
    } catch (error) {
      logger.warn(`Failed to clean up crawler job ${jobId}:`, error)
    }
  } catch (error) {
    // Errors during streaming (file processing errors, etc.) are yielded as error updates
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error streaming from SMB crawler service`
    logger.error(hints, errorMessage)
    yield { errorMessage, hints }
  }

  // Note: Errors from startCrawl() (authentication, connection, mount errors) will throw
  // and fail the entire run instead of being caught here
}
