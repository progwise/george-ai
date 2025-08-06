import fs from 'node:fs'
import path from 'node:path'

import { getUploadFilePath } from '@george-ai/file-management'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { prisma } from '../../prisma'
import { isFileSizeAcceptable } from './constants'
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
  const fileUpdateData = {
    name: `${fileName}`,
    libraryId: libraryId,
    mimeType,
    size: fileSize,
    updatedAt: fileModifiedTime,
    ...(processingError && {
      processingErrorMessage: processingError,
      processingErrorAt: new Date(),
    }),
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

  const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
  await fs.promises.copyFile(mountedFilePath, uploadedFilePath)

  return file
}

export async function* crawlSmb({
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
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

        // Check file size limits before processing
        const sizeCheck = isFileSizeAcceptable(fileToProcess.size)

        // Convert URI to mounted filesystem path and determine MIME type
        const mountedFilePath = uriToMountedPath(fileToProcess.uri, crawlerId)
        const mimeType = getMimeTypeFromExtension(fileToProcess.name)

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
            ...fileInfo,
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

        yield { ...fileInfo, hints: `SMB Crawler ${crawlerId} for file ${fileInfo.name}` }
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
