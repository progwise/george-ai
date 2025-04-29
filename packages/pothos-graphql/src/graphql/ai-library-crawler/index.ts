import { addCronJob, stopCronJob } from '../../cron-jobs'
import { deleteFileAndRecord } from '../../file-upload'
import { prisma } from '../../prisma'
import { AiLibraryCrawlerCronJobInput } from '../ai-library-crawler-cronjob'
import { builder } from '../builder'
import { runCrawler } from './run-crawler'

import './update-ai-library-crawler'

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
    isRunning: t.boolean({
      nullable: false,
      resolve: async (crawler) => {
        const ongoingRun = await prisma.aiLibraryCrawlerRun.findFirst({
          where: { crawlerId: crawler.id, endedAt: null },
        })

        return Boolean(ongoingRun)
      },
    }),
    cronJob: t.relation('cronJob'),
    filesCount: t.relationCount('files', { nullable: false }),
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
      cronJob: t.arg({ type: AiLibraryCrawlerCronJobInput, required: false }),
    },
    resolve: async (_query, _source, { cronJob, ...data }) => {
      const crawler = await prisma.aiLibraryCrawler.create({
        include: { cronJob: true },
        data: {
          ...data,
          cronJob: cronJob ? { create: cronJob } : undefined,
        },
      })

      if (crawler.cronJob) {
        await addCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

builder.mutationField('runAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      crawlerId: t.arg.string(),
      userId: t.arg.string(),
    },
    resolve: async (_query, _source, { crawlerId, userId }) => runCrawler({ crawlerId, userId }),
  }),
)

builder.mutationField('deleteAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }) => {
      const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({
        where: { id },
        include: { cronJob: true, files: true },
      })

      await Promise.all(crawler.files.map((file) => deleteFileAndRecord(file.id, file.libraryId)))
      await prisma.aiLibraryCrawler.delete({ where: { id } })
      if (crawler.cronJob) {
        await stopCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)
