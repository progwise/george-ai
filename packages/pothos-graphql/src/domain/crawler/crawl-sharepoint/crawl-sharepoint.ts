import { getMimeTypeFromExtension } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'

import { isFileSizeAcceptable } from '../../file/constants'
import { FileInfo, applyFileFilters } from '../../file/file-filter'
import { saveCrawlerFile } from '../common'
import { logger } from '../common'
import { CrawledFileInfo } from '../crawled-file-info'
import { getCrawlerCredentials } from '../crawler-credentials-manager'
import { CrawlOptions } from '../crawler-options'
import { parseSharePointUrl } from './parse-sharepoint-url'
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
  logger.info('Start SharePoint crawling', { crawlerId, uri, maxDepth, maxPages, libraryId })

  let processedPages = 0

  // Get stored SharePoint authentication cookies
  const { sharepointAuth: authCookies } = await getCrawlerCredentials(crawlerId)
  if (!authCookies) {
    throw new Error(`No SharePoint authentication found for crawler ${crawlerId}`)
  }

  // Parse the SharePoint URL to get site URL and REST API endpoint
  const { siteUrl, apiUrl, libName } = parseSharePointUrl(uri)

  const discoveryResult = await discoverSharePointSiteContent(apiUrl, authCookies)

  logger.debug('📚 Found  document libraries', { discoverSharePointSiteContent, libName })

  // Find the matching library
  const targetLibrary = discoveryResult.documentLibraries.find(
    (lib) => lib.title.toLowerCase() === libName.toLowerCase(),
  )

  if (targetLibrary) {
    logger.debug('✅ Found matching library', { libraryTitle: targetLibrary.title, itemCount: targetLibrary.itemCount })
  } else {
    logger.error('❌ Target library not found', {
      libName,
      availableLibraries: discoveryResult.documentLibraries.map((lib) => lib.title),
    })
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

      logger.debug('📅 Processing week ', { weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() })

      // Query this specific week range - fetch all items without $top limit
      let currentUrl = `${apiUrl}/web/lists/getbytitle('${targetLibrary.title}')/items?$select=ID,Title,FileLeafRef,Modified,FileRef,File/ServerRelativeUrl,File/Length&$expand=File&$filter=FSObjType eq 0 and Modified ge datetime'${startDateISO}' and Modified le datetime'${endDateISO}'&$orderby=Modified desc`

      // Process all pages for this week
      while (currentUrl && processedPages < maxPages) {
        logger.debug('📦 Fetching files from week', {
          week: weeksBack + 1,
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
        })

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
        logger.debug('📋 Found items in week', { week: weeksBack + 1, itemCount: items.length })

        if (items.length === 0) {
          logger.debug('📊 No files found in week', { week: weeksBack + 1 })
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
            logger.debug('Processing file', {
              fileName,
              fileUri,
              modified: item.Modified,
              fileSize: item.File?.Length || item.FileSizeDisplay || item.File_x0020_Size,
            })

            const fileSize = item.File?.Length || item.FileSizeDisplay || item.File_x0020_Size || 0
            const modificationDate = new Date(item.Modified)
            const serverRelativeUrl = item.File?.ServerRelativeUrl || item.FileRef
            const mimeType = getMimeTypeFromExtension(fileName)

            // Apply file filters if configured
            if (filterConfig) {
              const fileInfo: FileInfo = {
                fileName,
                filePath: fileUri,
                fileSize,
                modificationDate,
              }

              const filterResult = applyFileFilters(fileInfo, filterConfig)
              if (!filterResult.allowed) {
                logger.debug('SharePoint file filtered out', { fileName, fileUri, reason: filterResult.reason })

                // Record the omitted file
                await recordOmittedFile({
                  libraryId,
                  crawlerRunId,
                  filePath: fileUri,
                  fileName,
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

            // Build download URL for SharePoint files for reporting
            // Use alternative API for files with special characters (% or #)
            // const hasSpecialChars = /[%#]/.test(serverRelativeUrl)
            // const downloadUrl = hasSpecialChars
            //   ? `${siteUrl.origin}/_api/web/GetFileByServerRelativePath(decodedUrl='${encodeURIComponent(serverRelativeUrl)}')/$value`
            //   : `${siteUrl.origin}/_api/web/getfilebyserverrelativeurl('${encodeURIComponent(serverRelativeUrl)}')/$value`

            // Download file content from SharePoint
            const content = await downloadSharePointFile(siteUrl, serverRelativeUrl, authCookies)
            if (!sizeCheck.acceptable) {
              logger.warn('SharePoint file too large', { fileName, fileUri, fileSize, reason: sizeCheck.reason })
              continue
            }

            if (sizeCheck.shouldWarn) {
              logger.warn('SharePoint file size warning', { fileName, fileUri, fileSize, reason: sizeCheck.reason })
            }

            const fileInfo = await saveCrawlerFile({
              workspaceId,
              content,
              fileName,
              fileUri,
              libraryId,
              crawlerId,
              mimeType,
              modificationDate,
            })

            // Check if we should skip processing
            if (fileInfo.skipProcessing) {
              logger.debug(`Skipping processing for ${fileName} - file unchanged`)

              yield {
                id: fileInfo.fileId,
                name: fileInfo.fileName,
                originUri: fileInfo.originUri,
                mimeType: fileInfo.mimeType,
                skipProcessing: true,
                hints: 'SharePoint crawler file skipped (unchanged) \n' + JSON.stringify(fileInfo, null, 2),
              }
            } else {
              yield {
                id: fileInfo.fileId,
                name: fileInfo.fileName,
                originUri: fileInfo.originUri,
                mimeType: fileInfo.mimeType,
                skipProcessing: false,
                wasUpdated: fileInfo.wasUpdated,
                hints: `Sharepoint crawler file success \n${JSON.stringify(fileInfo, null, 2)}`,
              }
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            logger.error('Error processing SharePoint file', { fileName, errorMessage })
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

    logger.info('Finished SharePoint crawling.', { crawlerId, totalProcessedPages: processedPages })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const hints = `Error in SharePoint crawler crawling ${crawlerId}`
    logger.error(hints, { errorMessage })
    yield { hints, errorMessage }
  }
}

async function downloadSharePointFile(siteUrl: URL, serverRelativeUrl: string, authCookies: string): Promise<Buffer> {
  // Try primary API first
  let fileUrl = `${siteUrl.origin}/_api/web/getfilebyserverrelativeurl('${encodeURIComponent(serverRelativeUrl)}')/$value`

  logger.debug('Downloading SharePoint file from', { fileUrl })

  let response = await fetch(fileUrl, {
    method: 'GET',
    headers: {
      Cookie: authCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  logger.debug('Download response status', { status: response.status, statusText: response.statusText })

  // If primary API fails with 404 and path contains special characters, try alternative API
  if (!response.ok && response.status === 404) {
    const hasSpecialChars = /[%#]/.test(serverRelativeUrl)

    if (hasSpecialChars) {
      logger.debug(
        'Primary API failed with 404 for file with special characters, trying GetFileByServerRelativePath...',
        { fileUrl, serverRelativeUrl },
      )

      // Try alternative API for special characters
      fileUrl = `${siteUrl.origin}/_api/web/GetFileByServerRelativePath(decodedUrl='${encodeURIComponent(serverRelativeUrl)}')/$value`

      logger.debug('Retrying with alternative API', { fileUrl })

      response = await fetch(fileUrl, {
        method: 'GET',
        headers: {
          Cookie: authCookies,
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })

      logger.debug('Alternative API response status', { status: response.status, statusText: response.statusText })
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('Download error response', { errorText: errorText.substring(0, 500), fileUrl })

    if (response.status === 401 || response.status === 403) {
      throw new Error(`SharePoint file download authentication failed. Please refresh your authentication cookies.`)
    }

    throw new Error(`Failed to download SharePoint file from ${fileUrl}: ${response.status} ${response.statusText}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
