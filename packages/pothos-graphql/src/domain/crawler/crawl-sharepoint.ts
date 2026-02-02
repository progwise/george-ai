import { Readable } from 'node:stream'

import { getMimeTypeFromExtension } from '@george-ai/app-commons'
import { workspaceStorage } from '@george-ai/file-management'

import { prisma } from '../../../../app-database/src'
import { isFileSizeAcceptable } from '../file/constants'
import { FileInfo, applyFileFilters } from '../file/file-filter'
import { CrawledFileInfo } from './crawled-file-info'
import { getCrawlerCredentials } from './crawler-credentials-manager'
import { CrawlOptions } from './crawler-options'
import { parseSharePointUrl } from './sharepoint'
import { discoverSharePointSiteContent } from './sharepoint-discovery'

interface SharePointListItem {
  ID: number
  Title: string
  FileLeafRef: string
  Modified: string
  FileRef: string
  FileSizeDisplay?: number
  File_x0020_Size?: number
  File?: {
    ServerRelativeUrl: string
    Length?: number
  }
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

const saveSharepointCrawlerFile = async ({
  workspaceId,
  fileName,
  fileUri,
  libraryId,
  crawlerId,
  siteUrl,
  serverRelativeUrl,
  authCookies,
  mimeType,
  fileSize,
  fileModifiedTime,
  processingError,
}: {
  workspaceId: string
  fileName: string
  fileUri: string
  libraryId: string
  crawlerId: string
  siteUrl: URL
  serverRelativeUrl: string
  authCookies: string
  mimeType: string
  fileSize: number
  fileModifiedTime: Date
  processingError?: string
}) => {
  // Build download URL for SharePoint files for reporting
  // Use alternative API for files with special characters (% or #)
  const hasSpecialChars = /[%#]/.test(serverRelativeUrl)
  const downloadUrl = hasSpecialChars
    ? `${siteUrl.origin}/_api/web/GetFileByServerRelativePath(decodedUrl='${encodeURIComponent(serverRelativeUrl)}')/$value`
    : `${siteUrl.origin}/_api/web/getfilebyserverrelativeurl('${encodeURIComponent(serverRelativeUrl)}')/$value`

  // Handle error cases before DB operations
  if (processingError) {
    console.warn(`SharePoint file ${fileName}: ${processingError}`)
    return {
      id: undefined,
      name: fileName,
      originUri: fileUri,
      mimeType,
      skipProcessing: false,
      wasUpdated: false,
      downloadUrl,
    }
  }

  const crawlerUniqueKey = { crawledByCrawlerId_originUri: { crawledByCrawlerId: crawlerId, originUri: fileUri } }

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
    },
    update: {}, // Don't update on find - we'll update after hash comparison
    select: { id: true, name: true, originUri: true, mimeType: true, originFileHash: true },
  })

  const existingManifest = await workspaceStorage.getFile(workspaceId, { libraryId, fileId: dbFileInfo.id })
  const hashBefore = existingManifest?.sourceHash

  // Download file content from SharePoint
  const fileContent = await downloadSharePointFile(siteUrl, serverRelativeUrl, authCookies)

  const newManifest = await workspaceStorage.writeSource(workspaceId, {
    libraryId,
    fileId: dbFileInfo.id,
    stream: Readable.from([fileContent]),
    meta: {
      mimeType,
      originalName: fileName,
      originalUpdatedAt: fileModifiedTime.toISOString(),
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
        originModificationDate: fileModifiedTime,
        size: fileSize,
        mimeType,
      },
    })
  }

  return {
    ...dbFileInfo,
    skipProcessing: !contentChanged,
    wasUpdated: isUpdate,
    downloadUrl,
  }
}

export async function* crawlSharePoint({
  workspaceId,
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
  crawlerRunId,
  filterConfig,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start SharePoint crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)
  console.log(`Using credentials for crawler: ${crawlerId}`)

  let processedPages = 0

  // Get stored SharePoint authentication cookies
  const { sharepointAuth: authCookies } = await getCrawlerCredentials(crawlerId)
  if (!authCookies) {
    throw new Error(`No SharePoint authentication found for crawler ${crawlerId}`)
  }

  // Parse the SharePoint URL to get site URL and REST API endpoint
  const { siteUrl, apiUrl, libName } = parseSharePointUrl(uri)

  const discoveryResult = await discoverSharePointSiteContent(apiUrl, authCookies)

  console.log(`📚 Found ${discoveryResult.documentLibraries.length} document libraries`)
  console.log(`🎯 Looking for library: "${libName}"`)

  // Find the matching library
  const targetLibrary = discoveryResult.documentLibraries.find(
    (lib) => lib.title.toLowerCase() === libName.toLowerCase(),
  )

  if (targetLibrary) {
    console.log(`✅ Found matching library: "${targetLibrary.title}" (${targetLibrary.itemCount} items)`)
  } else {
    throw new Error(
      `❌ Library "${libName}" not found. Available libraries: ${discoveryResult.documentLibraries.map((lib) => lib.title).join(', ')}`,
    )
  }

  // Iterate week by week backwards from now for 2 years (104 weeks)
  const WEEKS_TO_SEARCH = 1040 // 20 years worth of weeks

  const currentDate = new Date()

  const headers: Record<string, string> = {
    Accept: 'application/json;odata=verbose',
    Cookie: authCookies,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }

  try {
    // Iterate week by week backwards for 2 years
    for (let weeksBack = 0; weeksBack < WEEKS_TO_SEARCH && processedPages < maxPages; weeksBack++) {
      // Calculate week range (backwards from current date)
      const weekStart = new Date(currentDate)
      weekStart.setDate(weekStart.getDate() - (weeksBack + 1) * 7) // Go back N weeks
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7) // Add 7 days
      weekEnd.setHours(23, 59, 59, 999)

      const startDateISO = weekStart.toISOString()
      const endDateISO = weekEnd.toISOString()

      console.log(
        `📅 Processing week ${weeksBack + 1}/${WEEKS_TO_SEARCH}: ${weekStart.toLocaleDateString('en-US')} - ${weekEnd.toLocaleDateString('en-US')}`,
      )

      // Query this specific week range - fetch all items without $top limit
      let currentUrl = `${apiUrl}/web/lists/getbytitle('${targetLibrary.title}')/items?$select=ID,Title,FileLeafRef,Modified,FileRef,File/ServerRelativeUrl,File/Length&$expand=File&$filter=FSObjType eq 0 and Modified ge datetime'${startDateISO}' and Modified le datetime'${endDateISO}'&$orderby=Modified desc`

      // Process all pages for this week
      while (currentUrl && processedPages < maxPages) {
        console.log(`📦 Fetching files from week ${weeksBack + 1}...`)

        const response = await fetch(currentUrl, {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          const errorText = await response.text()
          if (response.status === 500 && errorText.includes('SPQueryThrottledException')) {
            console.error(`❌ SharePoint throttling error for week ${weeksBack + 1}`)
            break // Skip this week and try the next one
          }
          throw new Error(`SharePoint API request failed: ${response.status} ${response.statusText}`)
        }

        const responseText = await response.text()
        if (responseText.trim().startsWith('<')) {
          throw new Error(
            `SharePoint authentication failed: received HTML instead of JSON. Please refresh your authentication cookies.`,
          )
        }

        const data = JSON.parse(responseText)
        const items: SharePointListItem[] = data.d?.results || []
        console.log(`📋 Found ${items.length} items in week ${weeksBack + 1}`)

        if (items.length === 0) {
          console.log(`📊 No files found in week ${weeksBack + 1}`)
          break // No more items in this week, move to next week
        }

        // Process all files from this week
        for (const item of items) {
          if (processedPages >= maxPages) break

          const fileName = item.FileLeafRef || item.Title || `Item_${item.ID}`
          // Process all files - let the processor decide what to do with them

          processedPages++

          const fileUri = `${siteUrl.origin}${item.FileRef}`

          try {
            console.log(`Processing file ${processedPages}/${maxPages}: ${fileName}`)

            const fileSize = item.File?.Length || item.FileSizeDisplay || item.File_x0020_Size || 0
            const fileModifiedTime = new Date(item.Modified)
            const serverRelativeUrl = item.File?.ServerRelativeUrl || item.FileRef
            const mimeType = getMimeTypeFromExtension(fileName)

            // Apply file filters if configured
            if (filterConfig) {
              const fileInfo: FileInfo = {
                fileName,
                filePath: fileUri,
                fileSize,
                modificationDate: fileModifiedTime,
              }

              const filterResult = applyFileFilters(fileInfo, filterConfig)
              if (!filterResult.allowed) {
                console.log(`SharePoint file filtered out: ${fileUri} - ${filterResult.reason}`)

                // Record the omitted file
                await recordOmittedFile({
                  libraryId,
                  crawlerRunId,
                  filePath: fileUri,
                  fileName,
                  fileSize,
                  reason: filterResult.reason || 'File filtered',
                  filterType: filterResult.filterType || 'unknown',
                  filterValue: filterResult.filterValue,
                })

                // Skip this file but continue processing others
                continue
              }
            }

            // Check file size limits before processing
            const sizeCheck = isFileSizeAcceptable(fileSize)

            if (!sizeCheck.acceptable) {
              console.warn(`SharePoint file too large ${fileName}: ${sizeCheck.reason}`)

              // Still create file record but mark as failed due to size
              const fileInfo = await saveSharepointCrawlerFile({
                workspaceId,
                siteUrl,
                serverRelativeUrl,
                authCookies,
                fileName,
                fileUri,
                libraryId,
                crawlerId,
                mimeType,
                fileSize,
                fileModifiedTime,
                processingError: `File too large: ${sizeCheck.reason}`,
              })

              yield {
                id: fileInfo.id,
                name: fileInfo.name,
                originUri: fileInfo.originUri,
                mimeType: fileInfo.mimeType,
                hints: `SharePoint crawler - file ${fileInfo.name} skipped due to size limit`,
              }
              continue
            }

            if (sizeCheck.shouldWarn) {
              console.warn(`SharePoint file ${fileName}: ${sizeCheck.reason}`)
            }

            const fileInfo = await saveSharepointCrawlerFile({
              workspaceId,
              siteUrl,
              serverRelativeUrl,
              authCookies,
              fileName,
              fileUri,
              libraryId,
              crawlerId,
              mimeType,
              fileSize,
              fileModifiedTime,
            })

            // Check if we should skip processing
            if (fileInfo.skipProcessing) {
              console.log(`Skipping processing for ${fileName} - file unchanged`)

              const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
              const downloadInfo = fileInfo.downloadUrl ? ` | Download URL: ${fileInfo.downloadUrl}` : ''
              const skipHints = [
                `${fileInfo.name} skipped (already processed with same hash)`,
                `Size: ${fileSizeMB} MB`,
                `Origin: ${fileUri}${downloadInfo}`,
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
                downloadUrl: fileInfo.downloadUrl,
                hints: `Sharepoint crawler file success \n${JSON.stringify(fileInfo, null, 2)}`,
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`Error processing SharePoint file ${fileName}:`, errorMessage)
            yield {
              hints: `Sharepoint crawl error for ${siteUrl.origin}${item.FileRef}`,
              errorMessage: errorMessage,
              originUri: fileUri,
              name: fileName,
            }
          }
        }

        // Get next page for this week
        currentUrl = data.d?.__next || null
      }
    }

    console.log(`Finished SharePoint crawling. Processed ${processedPages} files.`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error in SharePoint crawler crawling ${crawlerId}`
    console.error(hints, errorMessage)
    yield { hints, errorMessage }
  }
}

async function downloadSharePointFile(siteUrl: URL, serverRelativeUrl: string, authCookies: string): Promise<Buffer> {
  // Try primary API first
  let fileUrl = `${siteUrl.origin}/_api/web/getfilebyserverrelativeurl('${encodeURIComponent(serverRelativeUrl)}')/$value`

  console.log(`Downloading SharePoint file from: ${fileUrl}`)

  let response = await fetch(fileUrl, {
    method: 'GET',
    headers: {
      Cookie: authCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  console.log(`Download response status: ${response.status} ${response.statusText}`)

  // If primary API fails with 404 and path contains special characters, try alternative API
  if (!response.ok && response.status === 404) {
    const hasSpecialChars = /[%#]/.test(serverRelativeUrl)

    if (hasSpecialChars) {
      console.log(`Primary API failed with 404 for file with special characters, trying GetFileByServerRelativePath...`)

      // Try alternative API for special characters
      fileUrl = `${siteUrl.origin}/_api/web/GetFileByServerRelativePath(decodedUrl='${encodeURIComponent(serverRelativeUrl)}')/$value`

      console.log(`Retrying with alternative API: ${fileUrl}`)

      response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Cookie: authCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      console.log(`Alternative API response status: ${response.status} ${response.statusText}`)
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.log(`Download error response:`, errorText.substring(0, 500))

    if (response.status === 401 || response.status === 403) {
      throw new Error(`SharePoint file download authentication failed. Please refresh your authentication cookies.`)
    }

    throw new Error(`Failed to download SharePoint file from ${fileUrl}: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
