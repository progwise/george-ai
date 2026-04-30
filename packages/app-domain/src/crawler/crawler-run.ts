import { prisma } from '@george-ai/app-database'

import { parseFilterConfig } from '../file'
import { logger } from './common'
import { crawlApi } from './crawl-api'
import { crawlBox } from './crawl-box'
import { crawlHttp } from './crawl-http'
import { crawlSharePoint } from './crawl-sharepoint'
import { crawlSmb } from './crawl-smb'
import { CrawledFileInfo } from './crawled-file-info'
import { getCrawlerCredentials } from './crawler-credentials-manager'
import { CrawlerConfig } from './crawler-options'

export interface RunOptions {
  workspaceId: string
  crawlerId: string
  userId: string
  runByCronJob?: boolean
}

export type CrawlFunction = (options: {
  workspaceId: string
  uri: string
  maxDepth: number
  maxPages: number
  crawlerId: string
  libraryId: string
  crawlerRunId: string
  filterConfig: {
    includePatterns?: string[]
    excludePatterns?: string[]
    maxFileSize?: number
    minFileSize?: number
    allowedMimeTypes?: string[]
  }
  crawlerConfig?: CrawlerConfig | null
  credentials?: {
    username: string
    password: string
  }
}) => AsyncGenerator<CrawledFileInfo, void, void>

export const crawlersByType: Record<string, CrawlFunction> = {
  http: crawlHttp,
  smb: crawlSmb,
  sharepoint: crawlSharePoint,
  box: crawlBox,
  api: crawlApi,
}

export const createLibraryUpdate = (
  libraryId: string,
  crawlerRunId: string,
  fileId: string | null,
  message: string,
  updateType: string,
  downloadUrl?: string,
) => {
  const downloadInfo = downloadUrl ? ` | Download URL: ${downloadUrl}` : ''
  return prisma.aiLibraryUpdate.create({
    data: {
      libraryId,
      crawlerRunId,
      fileId,
      message: `${message}${downloadInfo}`,
      updateType,
    },
  })
}

export const stopCrawler = async ({ crawlerId }: RunOptions) => {
  const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { crawlerId, endedAt: null } })

  return prisma.aiLibraryCrawlerRun.update({
    where: { crawlerId, id: ongoingRun.id },
    data: { endedAt: new Date(), stoppedByUser: new Date() },
  })
}

export const runCrawler = async ({ workspaceId, crawlerId, runByCronJob }: RunOptions) => {
  const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({
    where: { id: crawlerId },
    include: {
      library: {
        select: { fileConverterOptions: true, autoProcessCrawledFiles: true },
      },
    },
  })

  const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirst({ where: { crawlerId, endedAt: null } })
  if (ongoingRun) {
    throw new Error('Crawler is already running')
  }

  const newRun = await prisma.aiLibraryCrawlerRun.create({
    data: { crawlerId, startedAt: new Date(), runByCronJob },
  })

  startCrawling(workspaceId, crawler, newRun).catch(async (error) => {
    logger.error('Error during crawling:', error)
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt: new Date(),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })
  })

  logger.info('Crawler started:', { crawler, newRun })
  return newRun
}

const startCrawling = async (
  workspaceId: string,
  crawler: {
    id: string
    uri: string
    uriType: string
    maxDepth: number
    maxPages: number
    libraryId: string
    includePatterns?: string | null
    excludePatterns?: string | null
    maxFileSize?: number | null
    minFileSize?: number | null
    allowedMimeTypes?: string | null
    crawlerConfig?: unknown | null
    library: { fileConverterOptions: string | null; autoProcessCrawledFiles: boolean }
  },
  newRun: { id: string; startedAt: Date },
) => {
  logger.info('Starting crawl:', { crawler })

  const filterConfig = parseFilterConfig(crawler)
  const crawl = crawlersByType[crawler.uriType]

  if (!crawl) {
    logger.error('No crawler implementation for type', { uriType: crawler.uriType })
    throw new Error(`Crawler for type ${crawler.uriType} not implemented`)
  }

  const storedCredentials = await getCrawlerCredentials(crawler.id)
  const credentials =
    storedCredentials.username && storedCredentials.password
      ? { username: storedCredentials.username, password: storedCredentials.password }
      : undefined

  try {
    for await (const crawledPage of crawl({
      workspaceId,
      uri: crawler.uri,
      maxDepth: crawler.maxDepth,
      maxPages: crawler.maxPages,
      crawlerId: crawler.id,
      libraryId: crawler.libraryId,
      crawlerRunId: newRun.id,
      filterConfig,
      crawlerConfig: crawler.crawlerConfig as never,
      credentials,
    })) {
      // Check if run was cancelled
      const crawlerRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { id: newRun.id } })
      if (crawlerRun.endedAt) {
        logger.warn('Crawler run was cancelled', { crawlerRunId: newRun.id })
        break
      }

      try {
        await processCrawledPage(crawledPage, crawler, newRun.id)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error('Error processing file', { errorMessage, page: crawledPage.name })
        await createLibraryUpdate(
          crawler.libraryId,
          newRun.id,
          null,
          `${crawledPage.originUri || crawledPage.name}: ${errorMessage}`,
          'error',
          crawledPage.downloadUrl,
        )
      }
    }

    const endedAt = new Date()
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt,
        success: true,
        errorMessage: null,
        crawler: { update: { lastRun: endedAt } },
      },
    })

    logger.info('Crawling completed:', { crawlerId: crawler.id })
    return prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawler.id } })
  } catch (error) {
    logger.error('Crawling error:', { crawlerId: crawler.id, error })
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt: new Date(),
        success: false,
        errorMessage: error instanceof Error ? `${error.cause}: ${error.message}` : String(error),
      },
    })
  }
}

const processCrawledPage = async (
  crawledPage: CrawledFileInfo,
  crawler: {
    id: string
    libraryId: string
    library: { autoProcessCrawledFiles: boolean }
  },
  crawlerRunId: string,
) => {
  // Handle error from crawler
  if (crawledPage.errorMessage) {
    logger.warn('Crawling error for page', { page: crawledPage.name, errorMessage: crawledPage.errorMessage })
    await createLibraryUpdate(
      crawler.libraryId,
      crawlerRunId,
      null,
      `${crawledPage.originUri || crawledPage.name}: ${crawledPage.errorMessage}`,
      'error',
      crawledPage.downloadUrl,
    )
    return
  }

  // Handle missing file ID
  if (!crawledPage.id) {
    logger.warn('Crawled page had no file id', { page: crawledPage.name })
    await createLibraryUpdate(
      crawler.libraryId,
      crawlerRunId,
      null,
      `${crawledPage.originUri || crawledPage.name}: No file ID returned`,
      'error',
      crawledPage.downloadUrl,
    )
    return
  }

  // Handle skipped files (unchanged content)
  if (crawledPage.skipProcessing) {
    logger.info('Skipping file (unchanged)', { page: crawledPage.name })

    // Unarchive since file is still active
    await prisma.aiLibraryFile.update({
      where: { id: crawledPage.id },
      data: { archivedAt: null },
    })

    await createLibraryUpdate(
      crawler.libraryId,
      crawlerRunId,
      crawledPage.id,
      crawledPage.hints || `${crawledPage.name} skipped (unchanged)`,
      'skipped',
      crawledPage.downloadUrl,
    )
    return
  }

  // Handle new or updated files
  const updateType = crawledPage.wasUpdated ? 'updated' : 'added'
  await createLibraryUpdate(
    crawler.libraryId,
    crawlerRunId,
    crawledPage.id,
    `${crawledPage.originUri || crawledPage.name} ${updateType}`,
    updateType,
    crawledPage.downloadUrl,
  )
  logger.info('Processed file', { updateType, page: crawledPage.name })
}
