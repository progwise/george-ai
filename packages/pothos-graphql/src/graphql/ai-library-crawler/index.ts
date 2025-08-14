import { GraphQLError } from 'graphql'

import { stopCronJob, upsertCronJob } from '../../cron-jobs'
import { deleteFile } from '../../file-upload'
import { prisma } from '../../prisma'
import { AiLibraryCrawlerCronJobInput } from '../ai-library-crawler-cronjob'
import { canAccessLibraryOrThrow } from '../ai-library/check-participation'
import { builder } from '../builder'
import { runCrawler, stopCrawler } from './run-crawler'

import './sharepoint'

import { removeSharePointCredentials, updateCrawlerSharePointCredentials } from './sharepoint-credentials-manager'
import { ensureCrawlerSmbShareMount, ensureCrawlerSmbShareUnmount, updateCrawlerSmbMount } from './smb-mount-manager'

console.log('Setting up: AiLibraryCrawler')

const AiLibraryCrawlerUriType = builder.enumType('AiLibraryCrawlerUriType', {
  values: ['http', 'smb', 'sharepoint'] as const,
})

const AiLibraryCrawlerCredentialsInput = builder.inputType('AiLibraryCrawlerCredentialsInput', {
  fields: (t) => ({
    username: t.string({ required: false }),
    password: t.string({ required: false }),
    sharepointAuth: t.string({ required: false }),
  }),
})
const AiLibraryCrawlerInput = builder.inputType('AiLibraryCrawlerInput', {
  fields: (t) => ({
    uri: t.string({ required: true }),
    uriType: t.field({ type: AiLibraryCrawlerUriType }),
    maxDepth: t.int({ required: true }),
    maxPages: t.int({ required: true }),
    includePatterns: t.stringList({ required: false }),
    excludePatterns: t.stringList({ required: false }),
    maxFileSize: t.int({ required: false }),
    minFileSize: t.int({ required: false }),
    allowedMimeTypes: t.stringList({ required: false }),
    cronJob: t.field({ type: AiLibraryCrawlerCronJobInput, required: false }),
  }),
})

const UpdateStats = builder.simpleObject('UpdateStats', {
  fields: (t) => ({
    updateType: t.string({ nullable: true }),
    count: t.int(),
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
    stoppedByUser: t.expose('stoppedByUser', { type: 'DateTime', nullable: true }),
    runByUserId: t.exposeID('runByUserId', { nullable: true }),
    updatesCount: t.relationCount('updates', { nullable: false }),
    filteredUpdatesCount: t.field({
      type: 'Int',
      nullable: false,
      args: {
        updateTypeFilter: t.arg.stringList({ required: false }),
      },
      resolve: async (run, args) => {
        const where: { crawlerRunId: string; updateType?: { in: string[] } } = { crawlerRunId: run.id }
        
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
        const where: { crawlerRunId: string; updateType?: { in: string[] } } = { crawlerRunId: run.id }
        
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
      type: AiLibraryCrawlerUriType,
      nullable: false,
      resolve: (crawler) => {
        switch (crawler.uriType) {
          case 'http':
            return 'http'
          case 'smb':
            return 'smb'
          case 'sharepoint':
            return 'sharepoint'
          default:
            throw new GraphQLError(`Unknown AiLibraryCrawlerUriType ${crawler.uriType}`)
        }
      },
    }),
    // File filter fields
    includePatterns: t.exposeString('includePatterns', { nullable: true }),
    excludePatterns: t.exposeString('excludePatterns', { nullable: true }),
    maxFileSize: t.exposeInt('maxFileSize', { nullable: true }),
    minFileSize: t.exposeInt('minFileSize', { nullable: true }),
    allowedMimeTypes: t.exposeString('allowedMimeTypes', { nullable: true }),
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

builder.queryField('aiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    nullable: false,
    args: {
      crawlerId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { crawlerId, libraryId }) =>
      prisma.aiLibraryCrawler.findFirstOrThrow({
        ...query,
        where: { id: crawlerId, libraryId },
      }),
  }),
)

builder.queryField('aiLibraryCrawlerRun', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: AiLibraryCrawlerRun,
    nullable: false,
    args: {
      crawlerRunId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { crawlerRunId, libraryId }, context) => {
      await canAccessLibraryOrThrow(context, libraryId)
      return await prisma.aiLibraryCrawlerRun.findFirstOrThrow({
        ...query,
        where: { id: crawlerRunId, crawler: { libraryId } },
      })
    },
  }),
)

builder.mutationField('createAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      libraryId: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryCrawlerInput, required: true }),
      credentials: t.arg({ type: AiLibraryCrawlerCredentialsInput, required: false }),
    },
    resolve: async (_query, _source, { libraryId, data, credentials }) => {
      const { cronJob, includePatterns, excludePatterns, allowedMimeTypes, ...input } = data

      const crawler = await prisma.aiLibraryCrawler.create({
        include: { cronJob: true },
        data: {
          ...input,
          libraryId,
          includePatterns: includePatterns ? JSON.stringify(includePatterns) : null,
          excludePatterns: excludePatterns ? JSON.stringify(excludePatterns) : null,
          allowedMimeTypes: allowedMimeTypes ? JSON.stringify(allowedMimeTypes) : null,
          cronJob: cronJob ? { create: cronJob } : undefined,
        },
      })

      if (data.uriType === 'http') {
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
        await removeSharePointCredentials(crawler.id)
      } else if (data.uriType === 'smb') {
        if (!credentials?.username || !credentials?.password) {
          throw new GraphQLError('Must provide username and password for uri type SMB')
        }
        await ensureCrawlerSmbShareMount({
          crawlerId: crawler.id,
          uri: data.uri,
          username: credentials.username,
          password: credentials.password,
        })
        await removeSharePointCredentials(crawler.id)
      } else if (data.uriType === 'sharepoint') {
        if (!credentials?.sharepointAuth) {
          throw new GraphQLError('Must provide sharepointAuth for uri type SharePoint')
        }
        await updateCrawlerSharePointCredentials(crawler.id, credentials.sharepointAuth)
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
      }

      if (crawler.cronJob) {
        await upsertCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

builder.mutationField('updateAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryCrawlerInput, required: true }),
      credentials: t.arg({ type: AiLibraryCrawlerCredentialsInput, required: false }),
    },
    resolve: async (_query, _source, { id, data, credentials }) => {
      const { cronJob, includePatterns, excludePatterns, allowedMimeTypes, ...input } = data
      const existingCrawler = await prisma.aiLibraryCrawler.findUnique({
        where: { id },
        include: { cronJob: true },
      })

      if (!existingCrawler) {
        throw new GraphQLError(`Crawler not found`)
      }

      if (data.uriType === 'http') {
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
        await removeSharePointCredentials(id)
      } else if (data.uriType === 'smb') {
        if (!credentials?.username || !credentials?.password) {
          throw new GraphQLError('Must provide username and password for uri type SMB')
        }
        // Update SMB mount with new credentials
        await updateCrawlerSmbMount({
          crawlerId: id,
          uri: data.uri,
          username: credentials.username,
          password: credentials.password,
        })
        await removeSharePointCredentials(id)
      } else if (data.uriType === 'sharepoint') {
        if (!credentials?.sharepointAuth) {
          throw new GraphQLError('Must provide sharepointAuth for uri type SharePoint')
        }
        await updateCrawlerSharePointCredentials(id, credentials.sharepointAuth)
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      }

      const crawler = await prisma.aiLibraryCrawler.update({
        where: { id },
        data: {
          ...input,
          includePatterns: includePatterns ? JSON.stringify(includePatterns) : null,
          excludePatterns: excludePatterns ? JSON.stringify(excludePatterns) : null,
          allowedMimeTypes: allowedMimeTypes ? JSON.stringify(allowedMimeTypes) : null,
          cronJob: existingCrawler.cronJob
            ? { update: cronJob ?? { active: false } }
            : { create: cronJob ?? undefined },
        },
        include: { cronJob: true },
      })

      if (crawler.cronJob) {
        await upsertCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

builder.mutationField('runAiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'String',
    nullable: false,
    args: {
      crawlerId: t.arg.string(),
    },
    resolve: async (_source, { crawlerId }, context) => {
      const run = await runCrawler({ crawlerId, userId: context.session.user.id })
      return run.id
    },
  }),
)

builder.mutationField('stopAiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'String',
    nullable: false,
    args: {
      crawlerId: t.arg.string(),
    },
    resolve: async (_source, { crawlerId }, context) => {
      const run = await stopCrawler({ crawlerId, userId: context.session.user.id })
      return run.id
    },
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

      await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      await removeSharePointCredentials(id)

      return crawler
    },
  }),
)
