import fs from 'node:fs'
import path from 'node:path'

import { getUploadFilePath } from '@george-ai/file-management'
import { getMimeTypeFromExtension } from '@george-ai/web-utils'

import { prisma } from '../../prisma'
import { CrawledFileInfo } from './crawled-file-info'
import { CrawlOptions } from './crawler-options'
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
}) => {
  const fileUpdateData = {
    name: `${fileName}`,
    libraryId: libraryId,
    mimeType,
    size: parseInt(fileSize.toString()), // some sharepoint field is not a number
    updatedAt: fileModifiedTime,
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

  // For large libraries (>5000 items), iterate month by month backwards from now
  // This keeps each query under the 5000 item threshold
  const BATCH_SIZE = 100 // Small batch size per request
  const TARGET_ITEMS_PER_BATCH = 5 // Process only 5 items at a time for fast response

  const currentDate = new Date()
  let monthsBack = 0
  let itemsProcessedInCurrentBatch = 0
  let consecutiveEmptyMonths = 0
  const MAX_CONSECUTIVE_EMPTY_MONTHS = 3 // Stop after 3 consecutive months with no files
  const MAX_MONTHS_TO_SEARCH = 24 // Don't go back more than 2 years

  const headers: Record<string, string> = {
    Accept: 'application/json;odata=verbose',
    Cookie: authCookies,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
  try {
    // Iterate month by month backwards from now until no more files or we hit maxPages
    while (processedPages < maxPages) {
      // Calculate month range (backwards from current date)
      const monthStart = new Date(currentDate)
      monthStart.setMonth(monthStart.getMonth() - monthsBack - 1) // Go to start of target month
      monthStart.setDate(1) // First day of month
      monthStart.setHours(0, 0, 0, 0)

      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1) // Next month
      monthEnd.setDate(0) // Last day of current month
      monthEnd.setHours(23, 59, 59, 999)

      const startDateISO = monthStart.toISOString()
      const endDateISO = monthEnd.toISOString()

      console.log(`📅 Processing month: ${monthStart.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`)

      // Query this specific month range (should be well under 5000 items per month)
      let currentUrl = `${apiUrl}/web/lists/getbytitle('${targetLibrary.title}')/items?$select=ID,Title,FileLeafRef,Modified,FileRef,File/ServerRelativeUrl,File/Length&$expand=File&$filter=FSObjType eq 0 and Modified ge datetime'${startDateISO}' and Modified le datetime'${endDateISO}'&$top=${BATCH_SIZE}&$orderby=Modified desc`

      let foundFilesInMonth = false
      itemsProcessedInCurrentBatch = 0

      // Process all pages for this month
      while (currentUrl && processedPages < maxPages && itemsProcessedInCurrentBatch < TARGET_ITEMS_PER_BATCH) {
        console.log(
          `📦 Fetching files from ${monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}...`,
        )

        const response = await fetch(currentUrl, {
          method: 'GET',
          headers,
        })

        if (!response.ok) {
          const errorText = await response.text()
          if (response.status === 500 && errorText.includes('SPQueryThrottledException')) {
            console.error(`❌ SharePoint throttling error for month ${monthStart.toLocaleDateString()}`)
            break // Skip this month and try the next one
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
        console.log(
          `📋 Found ${items.length} items in ${monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        )

        if (items.length === 0) {
          break // No more items in this month
        }

        foundFilesInMonth = true

        // Process files from this month
        for (const item of items) {
          if (processedPages >= maxPages || itemsProcessedInCurrentBatch >= TARGET_ITEMS_PER_BATCH) break

          const fileName = item.FileLeafRef || item.Title || `Item_${item.ID}`
          // Process all files - let the processor decide what to do with them

          processedPages++
          itemsProcessedInCurrentBatch++

          try {
            console.log(`Processing file (${itemsProcessedInCurrentBatch}/${TARGET_ITEMS_PER_BATCH}): ${fileName}`)

            const fileSize = item.File?.Length || item.FileSizeDisplay || item.File_x0020_Size || 0
            const fileModifiedTime = new Date(item.Modified)
            const serverRelativeUrl = item.File?.ServerRelativeUrl || item.FileRef
            const fileUri = `${apiUrl}${item.FileRef}`

            // Determine MIME type from file extension
            const mimeType = getMimeTypeFromExtension(fileName)

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

        // Stop processing this batch if we've reached the target, but continue to next month if needed
        if (itemsProcessedInCurrentBatch >= TARGET_ITEMS_PER_BATCH) {
          console.log(`✅ Processed ${itemsProcessedInCurrentBatch} files in this batch`)
          break // Break from the current month's processing, continue to next month
        }

        // Get next page for this month
        currentUrl = data.d?.__next || null
      }

      // Track consecutive empty months
      if (!foundFilesInMonth) {
        consecutiveEmptyMonths++
        console.log(
          `📊 No files found in ${monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} (${consecutiveEmptyMonths}/${MAX_CONSECUTIVE_EMPTY_MONTHS} consecutive empty months)`,
        )

        // Stop if we've had too many consecutive empty months
        if (consecutiveEmptyMonths >= MAX_CONSECUTIVE_EMPTY_MONTHS) {
          console.log(`📊 Stopping after ${MAX_CONSECUTIVE_EMPTY_MONTHS} consecutive months with no files`)
          break
        }
      } else {
        // Reset counter if we found files
        consecutiveEmptyMonths = 0
      }

      monthsBack++

      // Safety check - don't go back more than MAX_MONTHS_TO_SEARCH
      if (monthsBack >= MAX_MONTHS_TO_SEARCH) {
        console.log(`📊 Reached ${MAX_MONTHS_TO_SEARCH} month limit - stopping search`)
        break
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

function parseSharePointUrl(uri: string) {
  console.log(`Parsing Sharepoint URI ${uri}`)
  try {
    const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri
    const fullUrl = new URL(cleanUri)
    const pathParts = fullUrl.pathname.split('/').filter((part) => part.length > 0)

    // For downloading files, we need the base SharePoint site URL (without library path)
    const siteUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}`)
    const apiUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}/_api`)

    const libName = pathParts[pathParts.length - 1]
    const siteName = pathParts.slice(0, -1).join('/')

    console.log(`Parsed - siteUrl: ${siteUrl}, apiUrl: ${apiUrl}, libName: ${libName}`)

    return { siteUrl, apiUrl, siteName, libName }
  } catch (error) {
    console.error(`Error parsing sharepoint URL ${uri}`, error)
    throw error
  }
}

