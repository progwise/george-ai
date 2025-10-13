import { prisma } from '../../prisma'
import { builder } from '../builder'

import '../../domain/crawler/sharepoint'
import './queries'
import './mutations'

import { CrawlerUriType } from '../../domain/crawler/crawler-uri-types'

console.log('Setting up: AiLibraryCrawler')

const UpdateStats = builder.simpleObject('UpdateStats', {
  fields: (t) => ({
    updateType: t.string({ nullable: true }),
    count: t.int(),
  }),
})

builder.prismaObject('AiLibraryCrawlerRun', {
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
    stoppedByUser: t.expose('stoppedByUser', { type: 'DateTime', nullable: true }),
    runByUserId: t.exposeID('runByUserId', { nullable: true }),
    runBy: t.relation('runBy', { nullable: true }),
    updatesCount: t.relationCount('updates', { nullable: false }),
    filteredUpdatesCount: t.field({
      type: 'Int',
      nullable: false,
      args: {
        updateTypeFilter: t.arg.stringList({ required: false }),
      },
      resolve: async (run, args) => {
        const where: {
          crawlerRunId: string
          updateType?: { in: string[] }
        } = { crawlerRunId: run.id }

        // Add filter for update types if provided
        if (args.updateTypeFilter && args.updateTypeFilter.length > 0) {
          where.updateType = { in: args.updateTypeFilter }
        }

        return await prisma.aiLibraryUpdate.count({ where })
      },
    }),
    updateStats: t.field({
      type: [UpdateStats],
      nullable: false,
      resolve: async (run) => {
        const groups = await prisma.aiLibraryUpdate.groupBy({
          by: ['updateType'],
          where: { crawlerRunId: run.id },
          _count: true,
        })

        return groups.map((group) => ({
          updateType: group.updateType,
          count: group._count,
        }))
      },
    }),
    updates: t.prismaField({
      type: ['AiLibraryUpdate'],
      nullable: false,
      args: {
        take: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
        updateTypeFilter: t.arg.stringList({ required: false }),
      },
      resolve: async (query, run, args) => {
        const where: {
          crawlerRunId: string
          updateType?: { in: string[] }
        } = { crawlerRunId: run.id }

        // Add filter for update types if provided
        if (args.updateTypeFilter && args.updateTypeFilter.length > 0) {
          where.updateType = { in: args.updateTypeFilter }
        }

        return await prisma.aiLibraryUpdate.findMany({
          ...query,
          where,
          orderBy: { createdAt: 'desc' },
          take: args.take,
          skip: args.skip,
        })
      },
    }),
  }),
})

builder.prismaObject('AiLibraryCrawler', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    uri: t.exposeString('uri', { nullable: false }),
    uriType: t.field({
      type: 'CrawlerUriType',
      nullable: false,
      resolve: (crawler) => crawler.uriType as CrawlerUriType,
    }),
    // File filter fields
    includePatterns: t.exposeString('includePatterns', { nullable: true }),
    excludePatterns: t.exposeString('excludePatterns', { nullable: true }),
    maxFileSize: t.exposeInt('maxFileSize', { nullable: true }),
    minFileSize: t.exposeInt('minFileSize', { nullable: true }),
    allowedMimeTypes: t.exposeString('allowedMimeTypes', { nullable: true }),
    lastRun: t.prismaField({
      type: 'AiLibraryCrawlerRun',
      nullable: true,
      resolve: (_query, crawler) =>
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
    runs: t.prismaField({
      type: ['AiLibraryCrawlerRun'],
      args: {
        take: t.arg.int({ defaultValue: 10 }),
        skip: t.arg.int({ defaultValue: 0 }),
      },
      nullable: false,
      resolve: (_query, crawler, args) =>
        prisma.aiLibraryCrawlerRun.findMany({
          where: { crawlerId: crawler.id },
          take: args.take,
          skip: args.skip,
          orderBy: { startedAt: 'desc' },
        }),
    }),
  }),
})
