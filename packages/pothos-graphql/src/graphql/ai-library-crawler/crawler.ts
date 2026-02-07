import { prisma } from '@george-ai/app-database'

import { CrawlerUriType } from '../../domain/crawler/crawler-uri-types'
import { builder } from '../builder'

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
    crawlerConfig: t.field({
      type: 'String',
      nullable: true,
      resolve: (crawler) => (crawler.crawlerConfig ? JSON.stringify(crawler.crawlerConfig) : null),
    }),
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
