import fs from 'node:fs'
import path from 'node:path'

import { getUploadFilePath } from '@george-ai/file-management'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { prisma } from '../../prisma'
import { isFileSizeAcceptable } from '../file/constants'
import { FileInfo, applyFileFilters } from '../file/file-filter'
import { calculateFileHash } from '../file/file-hash'
import { CrawledFileInfo } from './crawled-file-info'
import { getCrawlerCredentials } from './crawler-credentials-manager'
import { CrawlOptions } from './crawler-options'

const BOX_API_BASE_URL = 'https://api.box.com/2.0'

interface BoxItem {
  type: 'file' | 'folder'
  id: string
  name: string
  size?: number
  modified_at?: string
  content_modified_at?: string
}

interface BoxFolderItemsResponse {
  entries: BoxItem[]
  total_count: number
  offset: number
  limit: number
}

interface BoxFileToProcess {
  id: string
  name: string
  size: number
  modifiedTime: Date
  parentPath: string
  depth: number
}

async function fetchBoxApi(endpoint: string, accessToken: string): Promise<Response> {
  const response = await fetch(`${BOX_API_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Box API error: ${response.status} ${response.statusText}`)
  }

  return response
}

async function listFolderItems(folderId: string, accessToken: string, offset = 0): Promise<BoxFolderItemsResponse> {
  const fields = 'type,id,name,size,modified_at,content_modified_at'
  const limit = 1000 // Box API max limit per request
  const response = await fetchBoxApi(
    `/folders/${folderId}/items?fields=${fields}&limit=${limit}&offset=${offset}`,
    accessToken,
  )

  return response.json()
}

async function downloadBoxFile(fileId: string, accessToken: string): Promise<Buffer> {
  const response = await fetch(`${BOX_API_BASE_URL}/files/${fileId}/content`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    redirect: 'follow', // Box API returns 302 redirect to actual download URL
  })

  if (!response.ok) {
    throw new Error(`Box file download error: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
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

const saveBoxCrawlerFile = async ({
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  mimeType,
  fileSize,
  fileModifiedTime,
  fileContent,
  processingError,
}: {
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  mimeType: string
  fileSize: number
  fileModifiedTime: Date
  fileContent?: Buffer
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

  // If no processing error and we have file content, handle file hash calculation
  if (!processingError && fileContent) {
    // Calculate hash from the buffer
    const tempFilePath = path.join('/tmp', `box-temp-${Date.now()}-${fileName}`)
    await fs.promises.writeFile(tempFilePath, fileContent)

    try {
      fileHash = await calculateFileHash(tempFilePath)

      // Check if this file was already processed with the same hash
      if (existingFile && existingFile.originFileHash === fileHash) {
        console.log(`Skipping Box file ${fileName} - already processed with same hash`)
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

      // Save file to final location
      const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId })
      await fs.promises.mkdir(path.dirname(uploadedFilePath), { recursive: true })
      await fs.promises.copyFile(tempFilePath, uploadedFilePath)

      return { ...file, skipProcessing, wasUpdated }
    } finally {
      // Clean up temp file
      await fs.promises.unlink(tempFilePath).catch(() => {})
    }
  }

  // For processing errors, just update database without saving file
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

export async function* crawlBox({
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
  crawlerRunId,
  filterConfig,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start Box crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)

  // Get Box credentials from stored credentials
  const credentials = await getCrawlerCredentials(crawlerId)
  const accessToken = credentials['boxToken'] as string

  if (!accessToken) {
    const errorMessage = 'Box access token not found in crawler credentials'
    console.error(errorMessage)
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
    for await (const fileToProcess of discoverBoxFilesAndFoldersStreaming(folderId, '', 0, maxDepth, accessToken)) {
      if (processedPages >= maxPages) {
        console.log(`Reached maxPages limit (${maxPages}), stopping crawl`)
        break
      }

      processedPages++

      try {
        console.log(`Processing Box file: ${fileToProcess.name} (ID: ${fileToProcess.id})`)

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
            console.log(`Box file filtered out: ${fileUri} - ${filterResult.reason}`)

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
          console.warn(`Box file too large ${fileUri}: ${sizeCheck.reason}`)

          // Still create file record but mark as failed due to size
          const fileInfo = await saveBoxCrawlerFile({
            fileName: fileToProcess.name,
            crawlerId,
            libraryId,
            fileModifiedTime: fileToProcess.modifiedTime,
            fileSize: fileToProcess.size,
            mimeType,
            fileUri,
            processingError: `File too large: ${sizeCheck.reason}`,
          })

          yield {
            id: fileInfo.id,
            name: fileInfo.name,
            originUri: fileInfo.originUri,
            mimeType: fileInfo.mimeType,
            skipProcessing: false,
            hints: `Box Crawler ${crawlerId} - file ${fileInfo.name} skipped due to size limit`,
          }
          continue
        }

        if (sizeCheck.shouldWarn) {
          console.warn(`Box file ${fileUri}: ${sizeCheck.reason}`)
        }

        // Download file content
        const fileContent = await downloadBoxFile(fileToProcess.id, accessToken)

        const fileInfo = await saveBoxCrawlerFile({
          fileName: fileToProcess.name,
          crawlerId,
          libraryId,
          fileModifiedTime: fileToProcess.modifiedTime,
          fileSize: fileToProcess.size,
          mimeType,
          fileUri,
          fileContent,
        })

        // Check if we should skip processing
        if (fileInfo.skipProcessing) {
          console.log(`Skipping processing for Box file ${fileToProcess.name} - file unchanged`)

          const fileSizeMB = (fileToProcess.size / (1024 * 1024)).toFixed(2)
          const skipHints = [
            `Box crawler - file ${fileInfo.name} skipped (already processed with same hash)`,
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
            downloadUrl: fileUri, // Browser-accessible Box URL
            hints: `Box Crawler ${crawlerId} for file ${fileInfo.name}`,
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const hints = `Error processing Box file ${fileToProcess.name} (ID: ${fileToProcess.id}) in crawler ${crawlerId}`
        console.error(hints, errorMessage)
        yield { errorMessage, hints }
      }
    }

    console.log(`Finished Box crawling. Processed ${processedPages} files.`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error in Box crawler ${crawlerId}`
    console.error(hints, errorMessage)
    yield { errorMessage, hints }
  }
}

async function* discoverBoxFilesAndFoldersStreaming(
  folderId: string,
  currentPath: string,
  currentDepth: number,
  maxDepth: number,
  accessToken: string,
  processedUris: Set<string> = new Set<string>(),
): AsyncGenerator<BoxFileToProcess, void, void> {
  if (currentDepth > maxDepth) {
    return
  }

  const folderUri = `box://${currentPath}/${folderId}`.replace('//', '/')
  if (processedUris.has(folderUri)) {
    return
  }

  processedUris.add(folderUri)
  console.log(`Discovering files in Box folder ID: ${folderId} (depth: ${currentDepth})`)

  try {
    let offset = 0
    let hasMore = true
    const subfolders: Array<{ id: string; path: string }> = []

    // Box API uses pagination, so we need to fetch all pages
    while (hasMore) {
      const response = await listFolderItems(folderId, accessToken, offset)

      for (const item of response.entries) {
        const itemPath = `${currentPath}/${item.name}`.replace('//', '/')

        if (item.type === 'file') {
          const modifiedTime = new Date(item.content_modified_at || item.modified_at || Date.now())

          // Yield file immediately
          yield {
            id: item.id,
            name: item.name,
            size: item.size || 0,
            modifiedTime,
            parentPath: currentPath,
            depth: currentDepth,
          }
        } else if (item.type === 'folder' && currentDepth < maxDepth) {
          // Collect subfolders to process after current folder files
          subfolders.push({ id: item.id, path: itemPath })
        }
      }

      // Check if there are more items to fetch
      offset += response.entries.length
      hasMore = offset < response.total_count
    }

    // After yielding all files in current folder, recursively process subfolders
    for (const subfolder of subfolders) {
      yield* discoverBoxFilesAndFoldersStreaming(
        subfolder.id,
        subfolder.path,
        currentDepth + 1,
        maxDepth,
        accessToken,
        processedUris,
      )
    }
  } catch (error) {
    console.error(`Error listing Box folder ${folderId}:`, error)
    // Continue with other directories even if this one fails
  }
}
