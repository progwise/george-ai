import fs from 'node:fs'
import path from 'node:path'

import { getUploadFilePath } from '@george-ai/file-management'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { prisma } from '../../prisma'
import { isFileSizeAcceptable } from './constants'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'
import { parseSharePointUrl } from './sharepoint'
import { getSharePointCredentials } from './sharepoint-credentials-manager'
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

const saveSharepointCrawlerFile = async ({
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
  const fileUpdateData = {
    name: `${fileName}`,
    libraryId: libraryId,
    mimeType,
    size: parseInt(fileSize.toString()), // some sharepoint field is not a number
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
  await downloadSharePointFileToPath(siteUrl, serverRelativeUrl, authCookies, uploadedFilePath)

  return file
}

export async function* crawlSharePoint({
  uri,
  maxDepth,
  maxPages,
  crawlerId,
  libraryId,
}: CrawlOptions): AsyncGenerator<CrawledFileInfo, void, void> {
  console.log(`Start SharePoint crawling ${uri} with maxDepth: ${maxDepth} and maxPages: ${maxPages}`)
  console.log(`Using credentials for crawler: ${crawlerId}`)

  let processedPages = 0

  // Get stored SharePoint authentication cookies
  const authCookies = await getSharePointCredentials(crawlerId)
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
  const WEEKS_TO_SEARCH = 104 // 2 years worth of weeks

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

          try {
            console.log(`Processing file ${processedPages}/${maxPages}: ${fileName}`)

            const fileSize = item.File?.Length || item.FileSizeDisplay || item.File_x0020_Size || 0

            // Check file size limits before processing
            const sizeCheck = isFileSizeAcceptable(fileSize)
            const fileModifiedTime = new Date(item.Modified)
            const serverRelativeUrl = item.File?.ServerRelativeUrl || item.FileRef
            const fileUri = `${apiUrl}${item.FileRef}`
            const mimeType = getMimeTypeFromExtension(fileName)

            if (!sizeCheck.acceptable) {
              console.warn(`SharePoint file too large ${fileName}: ${sizeCheck.reason}`)

              // Still create file record but mark as failed due to size
              const fileInfo = await saveSharepointCrawlerFile({
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

            yield {
              id: fileInfo.id,
              name: fileInfo.name,
              originUri: fileInfo.originUri,
              mimeType: fileInfo.mimeType,
              hints: `Sharepoint crawler file success \n${JSON.stringify(fileInfo, null, 2)}`,
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            console.error(`Error processing SharePoint file ${fileName}:`, errorMessage)
            yield { hints: `Sharepoint crawl error for ${apiUrl}${item.FileRef}`, errorMessage: errorMessage }
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

async function downloadSharePointFileToPath(
  siteUrl: URL,
  serverRelativeUrl: string,
  authCookies: string,
  filePath: string,
): Promise<void> {
  const fileUrl = `${siteUrl}/_api/web/getfilebyserverrelativeurl('${encodeURIComponent(serverRelativeUrl)}')/$value`

  console.log(`Downloading SharePoint file from: ${fileUrl}`)

  const response = await fetch(fileUrl, {
    method: 'GET',
    headers: {
      Cookie: authCookies,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  console.log(`Download response status: ${response.status} ${response.statusText}`)

  if (!response.ok) {
    const errorText = await response.text()
    console.log(`Download error response:`, errorText.substring(0, 500))

    if (response.status === 401 || response.status === 403) {
      throw new Error(`SharePoint file download authentication failed. Please refresh your authentication cookies.`)
    }

    throw new Error(`Failed to download SharePoint file: ${response.status} ${response.statusText}`)
  }

  // Create directory if it doesn't exist
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })

  // Write file content to disk
  const arrayBuffer = await response.arrayBuffer()
  await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer))

  console.log(`Successfully downloaded file to: ${filePath}`)
}
