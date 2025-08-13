import { prisma } from '../../prisma'
import { processFile } from '../ai-library-file/process-file'
import { crawlHttp } from './crawl-http'
import { crawlSharePoint } from './crawl-sharepoint'
import { crawlSmb } from './crawl-smb'
import { CrawledFileInfo } from './crawled-file-info'
import { parseFilterConfig } from './file-filter'

interface RunOptions {
  crawlerId: string
  userId?: string
  runByCronJob?: boolean
}

export const stopCrawler = async ({ crawlerId }: RunOptions) => {
  await prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawlerId } })

  const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { crawlerId, endedAt: null } })

  const run = await prisma.aiLibraryCrawlerRun.update({
    where: {
      crawlerId,
      id: ongoingRun.id,
    },
    data: {
      endedAt: new Date(),
      stoppedByUser: new Date(),
    },
  })

  return run
}

export const runCrawler = async ({ crawlerId, userId, runByCronJob }: RunOptions) => {
  const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({
    where: { id: crawlerId },
    include: {
      library: {
        select: {
          fileConverterOptions: true,
        },
      },
    },
  })

  const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirst({ where: { crawlerId, endedAt: null } })

  if (ongoingRun) {
    throw new Error('Crawler is already running')
  }

  const newRun = await prisma.aiLibraryCrawlerRun.create({
    data: {
      crawlerId,
      startedAt: new Date(),
      runByUserId: userId,
      runByCronJob,
    },
  })

  startCrawling(crawler, newRun, userId).catch((error) => {
    console.error('Error during crawling:', error)
    prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt: new Date(),
        success: false,
        errorMessage: error instanceof Error ? error.message : String(error),
      },
    })
    throw error
  })
  console.log('Crawler started:', crawler.id, 'Run ID:', newRun.id)
  return newRun
}
const startCrawling = async (
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
    library: { fileConverterOptions: string | null }
  },
  newRun: { id: string; startedAt: Date },
  userId?: string,
) => {
  console.log('Starting crawling for crawler', crawler.id, 'with URI:', crawler.uriType, crawler.uri)
  console.log('Crawler run ID:', newRun.id, 'by user:', userId)
  console.log('Crawler max depth:', crawler.maxDepth, 'max pages:', crawler.maxPages)
  console.log('Crawler library ID:', crawler.libraryId)
  console.log('Crawler run started at:', newRun.startedAt)

  // Parse filter configuration
  const filterConfig = parseFilterConfig(crawler)
  console.log('Filter configuration:', filterConfig)

  const crawl =
    crawler.uriType === 'http'
      ? crawlHttp
      : crawler.uriType === 'smb'
        ? crawlSmb
        : crawler.uriType === 'sharepoint'
          ? crawlSharePoint
          : null

  if (!crawl) {
    throw new Error(`Crawler for type ${crawler.uriType} not implemented`)
  }

  try {
    const crawledPages: CrawledFileInfo[] = []

    for await (const crawledPage of crawl({
      uri: crawler.uri,
      maxDepth: crawler.maxDepth,
      maxPages: crawler.maxPages,
      crawlerId: crawler.id,
      libraryId: crawler.libraryId,
      crawlerRunId: newRun.id,
      filterConfig,
    })) {
      try {
        const crawlerRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { id: newRun.id } })

        if (crawlerRun.endedAt) {
          console.warn(`crawler run ${newRun.id} was cancelled at ${crawlerRun.endedAt}`)
          break
        }
        if (crawledPage.errorMessage) {
          console.warn('Crawling error for page', crawledPage)
          crawledPages.push(crawledPage)
          continue
        }

        if (!crawledPage.id) {
          const errorMessage = `Crawled page had no file id ${JSON.stringify(crawledPage, null, 2)} `
          console.warn(errorMessage)
          crawledPages.push({ ...crawledPage, errorMessage })
          continue
        }

        // Check if we should skip processing this file
        if (crawledPage.skipProcessing) {
          console.log(`Skipping processing for file ${crawledPage.name} - already processed with same content`)
          crawledPages.push({ ...crawledPage, hints: crawledPage.hints + `\nFile skipped - already processed.` })

          await prisma.aiLibraryUpdate.create({
            data: {
              libraryId: crawler.libraryId,
              crawlerRunId: newRun.id,
              fileId: crawledPage.id,
              message: crawledPage.hints,
              success: true,
              updateType: 'skipped',
            },
          })
        } else {
          await processFile(crawledPage.id)
          crawledPages.push({ ...crawledPage, hints: crawledPage.hints + `\nCrawled paged was processed.` })
          await prisma.aiLibraryUpdate.create({
            data: {
              libraryId: crawler.libraryId,
              crawlerRunId: newRun.id,
              fileId: crawledPage.id,
              message: `${crawledPage.originUri || crawledPage.name}"`,
              success: true,
              updateType: 'added',
            },
          })
          console.log('Successfully processed crawled page', crawledPage.name, 'from', crawledPage.originUri)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.error(
          `Error during file processing in crawler ${crawler.id} for file ${JSON.stringify(crawledPage, null, 2)}`,
          error,
        )
        crawledPages.push({ ...crawledPage, errorMessage })
        await prisma.aiLibraryUpdate.create({
          data: {
            libraryId: crawler.libraryId,
            crawlerRunId: newRun.id,
            fileId: null,
            message: `${crawledPage.originUri || crawledPage.name}: ${errorMessage || 'Unknown error'}`,
            success: false,
          },
        })
        // Continue to the next page even if this one fails
        continue
      }
    }

    const endedAt = new Date()
    const errors = crawledPages
      .filter((page) => page.errorMessage)
      .map((page) => `${page.originUri}: ${page.errorMessage}`)
      .join(',\n')
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt,
        success: errors.length < 1, // If there are no errors, success is true
        errorMessage: errors || null,
        crawler: {
          update: { lastRun: endedAt },
        },
        pagesCrawled: crawledPages.length,
      },
    })

    console.log('Crawling completed successfully for crawler', crawler.id, 'with run ID:', newRun.id)
    console.log('Total pages crawled:', crawledPages.length)
    console.log('Crawling ended at:', endedAt)
    return prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawler.id } })
  } catch (error) {
    console.error('Crawling error')
    console.log('Crawler ID:', crawler.id)
    console.log('Crawler URI:', crawler.uri)
    console.log('Crawler max depth:', crawler.maxDepth)
    console.log('Crawler max pages:', crawler.maxPages)
    console.log('Crawler library ID:', crawler.libraryId)
    console.log('Crawler run ID:', newRun.id)
    console.log('Crawler run started at:', newRun.startedAt)
    console.error('Error details:', error)
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
