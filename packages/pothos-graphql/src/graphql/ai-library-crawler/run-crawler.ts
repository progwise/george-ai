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
      if (!crawledPage.metaData) {
        crawledPages.push({ ...crawledPage, url: null, error: 'No metadata' })
        continue
      }
      const metaData = JSON.parse(crawledPage.metaData)
      if (!crawledPage.markdown) {
        crawledPages.push({ ...crawledPage, url: metaData.url, error: 'No content' })
        continue
      }
      const markdown = crawledPage.markdown
      if (!metaData.url) {
        crawledPages.push({ ...crawledPage, url: null, error: 'No url' })
        continue
      }
      const fileUpdateData = {
        name: `${metaData.url} - ${metaData.title}`,
        mimeType: 'text/markdown',
        libraryId: crawler.libraryId,
      }

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

        await fs.writeFile(getFilePath(file.id), markdown)
        await completeFileUpload(file.id)
        await processFile(file.id)
      } catch (error) {
        console.error('Error during file processing', error)
        crawledPages.push({ ...crawledPage, url: metaData.url, error: 'File processing error' })
        continue
      }
    }

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
