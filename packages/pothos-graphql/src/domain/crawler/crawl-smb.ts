import fs from 'node:fs'
import path from 'node:path'

import { getUploadFilePath } from '@george-ai/file-management'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { prisma } from '../../prisma'
import { isFileSizeAcceptable } from '../file/constants'
import { FileInfo, applyFileFilters } from '../file/file-filter'
import { calculateFileHash } from '../file/file-hash'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'
import { uriToMountedPath } from './smb-mount-manager'

interface SmbFileToProcess {
  uri: string
  name: string
  size: number
  modifiedTime: Date
  depth: number
}

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
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  mimeType,
  fileSize,
  fileModifiedTime,
  mountedFilePath,
  processingError,
}: {
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  mimeType: string
  fileSize: number
  fileModifiedTime: Date
  mountedFilePath: string
  processingError?: string
}) => {
  // Check if file already exists
  const existingFile = await prisma.aiLibraryFile.findUnique({
    where: {
      crawledByCrawlerId_originUri: {
        crawledByCrawlerId: crawlerId,
        originUri: fileUri,
      },
    },
    select: {
      id: true,
      name: true,
      originUri: true,
      mimeType: true,
      originFileHash: true,
      originModificationDate: true,
    },
  })

  let fileHash: string | undefined
  let skipProcessing = false
  let wasUpdated = false

  // If no processing error, handle file hash calculation and skip logic
  if (!processingError) {
    // Check if existing file has a hash stored
    if (existingFile && !existingFile.originFileHash) {
      // Try to generate hash from existing uploaded file
      const existingFilePath = getUploadFilePath({ fileId: existingFile.id, libraryId })
      try {
        await fs.promises.access(existingFilePath)
        fileHash = await calculateFileHash(existingFilePath)
        console.log(`Generated hash for existing SMB file ${fileName}: ${fileHash}`)

        // Update the existing file with the hash
        await prisma.aiLibraryFile.update({
          where: { id: existingFile.id },
          data: { originFileHash: fileHash },
        })
      } catch {
        console.log(`Existing file not found on disk for ${fileName}, will copy from SMB`)
      }
    }

    // If we don't have a hash yet, calculate it from the mounted file
    if (!fileHash) {
      fileHash = await calculateFileHash(mountedFilePath)

      // Check if this file was already processed with the same hash
      if (existingFile && existingFile.originFileHash === fileHash) {
        console.log(`Skipping SMB file ${fileName} - already processed with same hash`)
        skipProcessing = true

        // Update modification date even if skipping
        await prisma.aiLibraryFile.update({
          where: { id: existingFile.id },
          data: {
            originModificationDate: fileModifiedTime,
            updatedAt: new Date(),
          },
        })

        return { ...existingFile, skipProcessing, wasUpdated }
      }

      // Determine if this is an update or new file
      wasUpdated = !!(existingFile && existingFile.originFileHash && existingFile.originFileHash !== fileHash)

      // Create/update file with hash
      const file = await prisma.aiLibraryFile.upsert({
        where: {
          crawledByCrawlerId_originUri: {
            crawledByCrawlerId: crawlerId,
            originUri: fileUri,
          },
        },
        create: {
          name: `${fileName}`,
          libraryId: libraryId,
          mimeType,
          size: fileSize,
          updatedAt: fileModifiedTime,
          originUri: fileUri,
          crawledByCrawlerId: crawlerId,
          originModificationDate: fileModifiedTime,
          originFileHash: fileHash,
        },
        update: {
          name: `${fileName}`,
          libraryId: libraryId,
          mimeType,
          size: fileSize,
          updatedAt: fileModifiedTime,
          originModificationDate: fileModifiedTime,
          originFileHash: fileHash,
        },
      })

      // Copy file to final location
      const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
      await fs.promises.mkdir(path.dirname(uploadedFilePath), { recursive: true })
      await fs.promises.copyFile(mountedFilePath, uploadedFilePath)

      return { ...file, skipProcessing, wasUpdated }
    } else if (existingFile) {
      // We have a hash from the existing file, check if it needs reprocessing
      console.log(`SMB file ${fileName} already processed with hash ${fileHash}`)
      skipProcessing = true
      return { ...existingFile, skipProcessing, wasUpdated }
    }
  }

  // For processing errors, just update database without copying
  wasUpdated = !!existingFile

  const fileUpdateData = {
    name: `${fileName}`,
    libraryId: libraryId,
    mimeType,
    size: fileSize,
    updatedAt: fileModifiedTime,
    originModificationDate: fileModifiedTime,
    processingErrorMessage: processingError,
    processingErrorAt: new Date(),
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

  return { ...file, skipProcessing, wasUpdated }
}

export async function* crawlSmb({
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
  crawlerRunId,
  filterConfig,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start SMB crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)
  console.log(`Using mount for crawler: ${crawlerId}`)

  let processedPages = 0
  const queue: SmbFileToProcess[] = []
  const processedUris = new Set<string>()

  try {
    // Start by discovering files and directories at the specified URI
    await discoverMountedFilesAndDirectories(uri, 0, queue, processedUris, maxDepth, crawlerId)

    console.log(`Discovery complete. Found ${queue.length} files to process`)

    // Process files in the queue
    while (queue.length > 0 && processedPages < maxPages) {
      const fileToProcess = queue.shift()!
      processedPages++

      try {
        console.log(`Processing SMB file: ${fileToProcess.uri}`)

        // Convert URI to mounted filesystem path and determine MIME type
        const mountedFilePath = uriToMountedPath(fileToProcess.uri, crawlerId)
        const mimeType = getMimeTypeFromExtension(fileToProcess.name)

        // Apply file filters if configured
        if (filterConfig) {
          const fileInfo: FileInfo = {
            fileName: fileToProcess.name,
            filePath: fileToProcess.uri,
            fileSize: fileToProcess.size,
            modificationDate: fileToProcess.modifiedTime,
          }

          const filterResult = applyFileFilters(fileInfo, filterConfig)
          if (!filterResult.allowed) {
            console.log(`SMB file filtered out: ${fileToProcess.uri} - ${filterResult.reason}`)

            // Record the omitted file
            await recordOmittedFile({
              libraryId,
              crawlerRunId,
              filePath: fileToProcess.uri,
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

        // Check file size limits before processing
        const sizeCheck = isFileSizeAcceptable(fileToProcess.size)

        if (!sizeCheck.acceptable) {
          console.warn(`SMB file too large ${fileToProcess.uri}: ${sizeCheck.reason}`)

          // Still create file record but mark as failed due to size
          const fileInfo = await saveSmbCrawlerFile({
            fileName: fileToProcess.name,
            crawlerId,
            libraryId,
            fileModifiedTime: fileToProcess.modifiedTime,
            fileSize: fileToProcess.size,
            mimeType,
            fileUri: fileToProcess.uri,
            mountedFilePath,
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
          console.warn(`SMB file ${fileToProcess.uri}: ${sizeCheck.reason}`)
        }

        const fileInfo = await saveSmbCrawlerFile({
          fileName: fileToProcess.name,
          crawlerId,
          libraryId,
          fileModifiedTime: fileToProcess.modifiedTime,
          fileSize: fileToProcess.size,
          mimeType,
          fileUri: fileToProcess.uri,
          mountedFilePath,
        })

        // Check if we should skip processing
        if (fileInfo.skipProcessing) {
          console.log(`Skipping processing for SMB file ${fileToProcess.name} - file unchanged`)

          const fileSizeMB = (fileToProcess.size / (1024 * 1024)).toFixed(2)
          const skipHints = [
            `SMB crawler - file ${fileInfo.name} skipped (already processed with same hash)`,
            `Size: ${fileSizeMB} MB`,
            `Origin: ${fileToProcess.uri}`,
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
            downloadUrl: mountedFilePath, // Provide local file path for SMB files
            hints: `SMB Crawler ${crawlerId} for file ${fileInfo.name}`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const hints = `Error processing SMB file ${fileToProcess.uri} in crawler ${crawlerId}`
        console.error(hints, errorMessage)
        yield { errorMessage, hints }
      }
    }

    console.log(`Finished SMB crawling. Processed ${processedPages} files.`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error in SMB crawler ${crawlerId}`
    console.error(hints, errorMessage)
    yield { errorMessage, hints }
  }
}

async function discoverMountedFilesAndDirectories(
  currentUri: string,
  currentDepth: number,
  queue: SmbFileToProcess[],
  processedUris: Set<string>,
  maxDepth: number,
  crawlerId: string,
): Promise<void> {
  if (currentDepth > maxDepth || processedUris.has(currentUri)) {
    return
  }

  processedUris.add(currentUri)
  console.log(`Discovering files in: ${currentUri} (depth: ${currentDepth})`)

  try {
    // Convert URI to mounted filesystem path
    const mountedPath = uriToMountedPath(currentUri, crawlerId)

    // Check if the path exists
    try {
      await fs.promises.access(mountedPath)
    } catch (error) {
      console.error(`SMB mount not found at ${mountedPath}.`, error)
      throw new Error(
        `SMB mount not found at ${mountedPath}. Ensure crawler has been updated with SMB credentials to create the mount.`,
      )
    }

    // List directory contents using fs
    console.log(`Listing files in mounted path: ${mountedPath}`)
    const entries = await fs.promises.readdir(mountedPath, { withFileTypes: true })
    console.log(`Found ${entries.length} entries in ${mountedPath}`)

    for (const entry of entries) {
      const entryUri = `${currentUri.endsWith('/') ? currentUri : currentUri + '/'}${entry.name}`
      const entryPath = path.join(mountedPath, entry.name)

      if (entry.isFile() && !processedUris.has(entryUri)) {
        // Process all files - let the processor decide what to do with them
        try {
          const stats = await fs.promises.stat(entryPath)
          queue.push({
            uri: entryUri,
            name: entry.name,
            size: stats.size,
            modifiedTime: stats.mtime,
            depth: currentDepth,
          })
        } catch (error) {
          console.warn(`Failed to stat file ${entryPath}:`, error)
        }
      } else if (entry.isDirectory() && currentDepth < maxDepth) {
        // Recursively explore subdirectories
        await discoverMountedFilesAndDirectories(entryUri, currentDepth + 1, queue, processedUris, maxDepth, crawlerId)
      }
    }
  } catch (error) {
    // Re-throw mount errors so they propagate to the main function
    if (error instanceof Error && error.message.includes('SMB mount not found')) {
      throw error
    }

    console.error(`Error listing directory ${currentUri}:`, error)
    // Continue with other directories even if this one fails
  }
}
