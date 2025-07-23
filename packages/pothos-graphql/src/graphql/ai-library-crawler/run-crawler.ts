import fs from 'node:fs'

import { getUploadFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { processFile } from '../ai-library-file/process-file'
import { crawl } from './crawl-client'

interface RunOptions {
  crawlerId: string
  userId?: string
  runByCronJob?: boolean
}

export const stopCrawler = async ({ crawlerId }: RunOptions) => {
  const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawlerId } })

  const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { crawlerId, endedAt: null } })

  await prisma.aiLibraryCrawlerRun.update({
    where: {
      crawlerId,
      id: ongoingRun.id,
    },
    data: {
      success: false,
      endedAt: new Date(),
      errorMessage: 'Run stopped by user',
    },
  })

  return crawler
}

export const runCrawler = async ({ crawlerId, userId, runByCronJob }: RunOptions) => {
  const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawlerId } })

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
  return crawler
}
const startCrawling = async (
  crawler: { id: string; url: string; maxDepth: number; maxPages: number; libraryId: string },
  newRun: { id: string; startedAt: Date },
  userId?: string,
) => {
  console.log('Starting crawling for crawler', crawler.id, 'with URL:', crawler.url)
  console.log('Crawler run ID:', newRun.id, 'by user:', userId)
  console.log('Crawler max depth:', crawler.maxDepth, 'max pages:', crawler.maxPages)
  console.log('Crawler library ID:', crawler.libraryId)
  console.log('Crawler run started at:', newRun.startedAt)

  try {
    const crawledPages: {
      url: string | null
      markdown: string | null
      metaData: string | null
      error: string | null
    }[] = []

    for await (const crawledPage of crawl({
      url: crawler.url,
      maxDepth: crawler.maxDepth,
      maxPages: crawler.maxPages,
    })) {
      const crawlerRun = await prisma.aiLibraryCrawlerRun.findFirstOrThrow({ where: { id: newRun.id } })
      if (crawlerRun.endedAt) {
        console.warn(`crawler run ${newRun.id} was cancelled at ${crawlerRun.endedAt}`)
        break
      }
      if (crawledPage.error) {
        console.warn('Crawling error for page', crawledPage.url, ':', crawledPage.error)
        crawledPages.push({ ...crawledPage, url: crawledPage.url, error: crawledPage.error })
        continue
      }
      if (!crawledPage.metaData) {
        crawledPages.push({ ...crawledPage, url: null, error: 'No metadata' })
        console.warn('Crawled page has no metadata', crawledPage)
        continue
      }
      const metaData = JSON.parse(crawledPage.metaData)
      if (!crawledPage.markdown) {
        crawledPages.push({ ...crawledPage, url: metaData.url, error: 'No content' })
        console.warn('Crawled page has no content', crawledPage)
        continue
      }
      const markdown = crawledPage.markdown
      if (!metaData.url) {
        crawledPages.push({ ...crawledPage, url: null, error: 'No url' })
        console.warn('Crawled page has no URL', crawledPage)
        continue
      }
      const fileUpdateData = {
        name: `${metaData.title}`,
        mimeType: 'text/markdown',
        libraryId: crawler.libraryId,
      }

      console.log('Processing crawled page', fileUpdateData.name, 'from', metaData.url)

      try {
        const file = await prisma.aiLibraryFile.upsert({
          where: {
            crawledByCrawlerId_originUri: {
              crawledByCrawlerId: crawler.id,
              originUri: metaData.url,
            },
          },
          create: {
            ...fileUpdateData,
            originUri: metaData.url,
            crawledByCrawlerId: crawler.id,
          },
          update: fileUpdateData,
        })

        const uploadedFilePath = getUploadFilePath({ fileId: file.id, libraryId: crawler.libraryId })
        await fs.promises.writeFile(uploadedFilePath, markdown)
        await processFile(file.id)
        crawledPages.push({ ...crawledPage, url: metaData.url, markdown, metaData: crawledPage.metaData, error: null })
        await prisma.aiLibraryUpdate.create({
          data: {
            libraryId: crawler.libraryId,
            crawlerRunId: newRun.id,
            fileId: file.id,
            message: `Crawled page from ${metaData.url} with title "${metaData.title}"`,
            success: true,
          },
        })
        console.log('Successfully processed crawled page', fileUpdateData.name, 'from', metaData.url)
      } catch (error) {
        console.error('Error during file processing', error)
        crawledPages.push({ ...crawledPage, url: metaData.url, error: 'File processing error' })
        await prisma.aiLibraryUpdate.create({
          data: {
            libraryId: crawler.libraryId,
            crawlerRunId: newRun.id,
            fileId: null,
            message: `Failed to process crawled page from ${metaData.url}: ${error instanceof Error ? error.message : String(error)}`,
            success: false,
          },
        })
        console.warn('Failed to process crawled page', fileUpdateData.name, 'from', metaData.url, error)
        // Continue to the next page even if this one fails
        continue
      }
    }

    const endedAt = new Date()
    const errors = crawledPages
      .filter((page) => page.error)
      .map((page) => `${page.url}: ${page.error}`)
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
    console.log('Crawler URL:', crawler.url)
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
