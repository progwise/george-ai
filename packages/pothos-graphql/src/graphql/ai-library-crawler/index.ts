import { promises as fs } from 'fs'

import { crawl } from '@george-ai/crawl4ai-client'

import { completeFileUpload, getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { processFile } from '../ai-library-file/process-file'
import { builder } from '../builder'

console.log('Setting up: AiLibraryCrawler')

builder.prismaObject('AiLibraryCrawler', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    url: t.exposeString('url', { nullable: false }),
    lastRun: t.expose('lastRun', { type: 'DateTime' }),
    maxDepth: t.exposeInt('maxDepth', { nullable: false }),
    maxPages: t.exposeInt('maxPages', { nullable: false }),

    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: false,
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: false,
    }),
  }),
})

builder.mutationField('createAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      url: t.arg.string(),
      maxDepth: t.arg.int(),
      maxPages: t.arg.int(),
      libraryId: t.arg.string(),
    },
    resolve: (query, _source, args) => {
      return prisma.aiLibraryCrawler.create({
        ...query,
        data: args,
      })
    },
  }),
)

builder.mutationField('runAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string(),
    },
    resolve: async (query, _source, { id }) => {
      const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({ where: { id } })

      const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirst({ where: { crawlerId: id, endedAt: null } })

      if (ongoingRun) {
        throw new Error('Crawler is already running')
      }

      const newRun = await prisma.aiLibraryCrawlerRun.create({
        data: {
          crawlerId: id,
          startedAt: new Date(),
        },
      })

      try {
        const crawledPages = await crawl({
          url: crawler.url,
          maxDepth: crawler.maxDepth,
          maxPages: crawler.maxPages,
        })

        console.log('Crawler response:', crawledPages)

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

        const hasUploadingOrProcessingErrors = resultsFromUploadAndProcessing.some(
          (result) => result.status === 'rejected',
        )
        if (hasUploadingOrProcessingErrors) {
          throw new Error('Some files failed to upload or to process')
        }

        return prisma.aiLibraryCrawler.findUniqueOrThrow({ ...query, where: { id } })
      } catch (error) {
        console.error('Error during crawling:', error)
        await prisma.aiLibraryCrawlerRun.update({
          where: { id: newRun.id },
          data: {
            endedAt: new Date(),
            success: false,
          },
        })

        throw error
      }
    },
  }),
)
