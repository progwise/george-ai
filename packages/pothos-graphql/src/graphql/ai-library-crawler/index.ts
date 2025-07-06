import { stopCronJob, upsertCronJob } from '../../cron-jobs'
import { deleteFile } from '../../file-upload'
import { prisma } from '../../prisma'
import { AiLibraryCrawlerCronJobInput } from '../ai-library-crawler-cronjob'
import { builder } from '../builder'
import { runCrawler } from './run-crawler'

import './update-ai-library-crawler'

console.log('Setting up: AiLibraryCrawler')

export const AiLibraryCrawlerInput = builder.inputType('AiLibraryCrawlerInput', {
  fields: (t) => ({
    url: t.string({ required: true }),
    maxDepth: t.int({ required: true }),
    maxPages: t.int({ required: true }),
    cronJob: t.field({ type: AiLibraryCrawlerCronJobInput, required: false }),
  }),
})

const AiLibraryCrawlerRun = builder.prismaObject('AiLibraryCrawlerRun', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    crawlerId: t.exposeID('crawlerId', { nullable: false }),
    crawler: t.relation('crawler', {
      nullable: false,
    }),
    startedAt: t.expose('startedAt', { type: 'DateTime', nullable: false }),
    endedAt: t.expose('endedAt', { type: 'DateTime', nullable: true }),
    success: t.exposeBoolean('success', { nullable: true }),
    errorMessage: t.exposeString('errorMessage', { nullable: true }),
    runByUserId: t.exposeID('runByUserId', { nullable: true }),
  }),
})

builder.prismaObject('AiLibraryCrawler', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    url: t.exposeString('url', { nullable: false }),
    lastRun: t.field({
      type: AiLibraryCrawlerRun,
      nullable: true,
      resolve: (crawler) =>
        prisma.aiLibraryCrawlerRun.findFirst({
          where: { crawlerId: crawler.id },
          take: 1,
          skip: 0,
          orderBy: { startedAt: 'desc' },
        }),
    }),
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
    runCount: t.relationCount('runs', { nullable: false }),
    runs: t.field({
      type: [AiLibraryCrawlerRun],
      args: {
        take: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
      },
      nullable: false,
      resolve: (crawler, args) =>
        prisma.aiLibraryCrawlerRun.findMany({
          where: { crawlerId: crawler.id },
          take: args.take,
          skip: args.skip,
          orderBy: { startedAt: 'desc' },
        }),
    }),
  }),
})

builder.mutationField('createAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      libraryId: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryCrawlerInput }),
    },
    resolve: async (_query, _source, { libraryId, data }) => {
      const { cronJob, ...input } = data

      const crawler = await prisma.aiLibraryCrawler.create({
        include: { cronJob: true },
        data: {
          ...input,
          libraryId,
          cronJob: cronJob ? { create: cronJob } : undefined,
        },
      })

      if (crawler.cronJob) {
        await upsertCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

builder.mutationField('runAiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawler',
    args: {
      crawlerId: t.arg.string(),
    },
    resolve: async (_query, _source, { crawlerId }, context) =>
      runCrawler({ crawlerId, userId: context.session.user.id }),
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

      await Promise.all(crawler.files.map((file) => deleteFile(file.id, file.libraryId)))
      await prisma.aiLibraryCrawler.delete({ where: { id } })
      if (crawler.cronJob) {
        await stopCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)
