import { promises as fs } from 'fs'

import { crawl } from '@george-ai/crawl4ai-client'

import { completeFileUpload, getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { processFile } from '../ai-library-file/process-file'

interface RunOptions {
  crawlerId: string
  userId?: string
  runByCronJob?: boolean
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

  try {
    const crawledPages = await crawl({
      url: crawler.url,
      maxDepth: crawler.maxDepth,
      maxPages: crawler.maxPages,
    })

    const endedAt = new Date()
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt,
        success: true,
        crawler: {
          update: { lastRun: endedAt },
        },
        pagesCrawled: crawledPages.length,
      },
    })

    const resultsFromUploadAndProcessing = await Promise.allSettled(
      crawledPages.map(async (page) => {
        const file = await prisma.aiLibraryFile.create({
          data: {
            name: `${page.url} - ${page.title}`,
            originUri: page.url,
            mimeType: 'text/markdown',
            libraryId: crawler.libraryId,
          },
        })

        await fs.writeFile(getFilePath(file.id), page.content)
        await completeFileUpload(file.id)
        await processFile(file.id)
      }),
    )

    const hasUploadingOrProcessingErrors = resultsFromUploadAndProcessing.some((result) => result.status === 'rejected')
    if (hasUploadingOrProcessingErrors) {
      throw new Error('Some files failed to upload or to process')
    }

    return prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id: crawlerId } })
  } catch (error) {
    console.error(
      'Error during crawling. crawler id: ',
      crawler.id,
      ', crawler run id:',
      newRun.id,
      ', user id:',
      userId,
      ', error:',
      error,
    )
    await prisma.aiLibraryCrawlerRun.update({
      where: { id: newRun.id },
      data: {
        endedAt: new Date(),
        success: false,
      },
    })

    throw error
  }
}
