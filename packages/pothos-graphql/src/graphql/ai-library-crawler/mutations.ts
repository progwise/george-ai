import { GraphQLError } from 'graphql'

import { deleteFile } from '../../domain'
import { canAccessLibraryOrThrow, runCrawler, stopCrawler, stopCronJob, upsertCronJob } from '../../domain'
import { removeCrawlerCredentials, updateCrawlerCredentials } from '../../domain/crawler/crawler-credentials-manager'
import { ensureCrawlerSmbShareUnmount } from '../../domain/crawler/smb-mount-manager'
import { prisma } from '../../prisma'
import { AiLibraryCrawlerCronJobInput } from '../ai-library-crawler-cronjob'
import { builder } from '../builder'

const AiLibraryCrawlerCredentialsInput = builder.inputType('AiLibraryCrawlerCredentialsInput', {
  fields: (t) => ({
    username: t.string({ required: false }),
    password: t.string({ required: false }),
    sharepointAuth: t.string({ required: false }),
    boxCustomerId: t.string({ required: false }),
    boxToken: t.string({ required: false }),
  }),
})
const AiLibraryCrawlerInput = builder.inputType('AiLibraryCrawlerInput', {
  fields: (t) => ({
    uri: t.string({ required: true }),
    uriType: t.field({ type: 'CrawlerUriType' }),
    maxDepth: t.int({ required: true }),
    maxPages: t.int({ required: true }),
    includePatterns: t.stringList({ required: false }),
    excludePatterns: t.stringList({ required: false }),
    maxFileSize: t.int({ required: false }),
    minFileSize: t.int({ required: false }),
    allowedMimeTypes: t.stringList({ required: false }),
    crawlerConfig: t.string({ required: false }),
    cronJob: t.field({ type: AiLibraryCrawlerCronJobInput, required: false }),
  }),
})

builder.mutationField('createAiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawler',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryCrawlerInput, required: true }),
      credentials: t.arg({ type: AiLibraryCrawlerCredentialsInput, required: false }),
    },
    resolve: async (_query, _source, { libraryId, data, credentials }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)

      const { cronJob, includePatterns, excludePatterns, allowedMimeTypes, crawlerConfig, ...input } = data

      // Parse crawlerConfig JSON with error handling
      let parsedCrawlerConfig = null
      if (crawlerConfig) {
        try {
          parsedCrawlerConfig = JSON.parse(crawlerConfig)
        } catch {
          throw new GraphQLError('Invalid JSON in crawlerConfig')
        }
      }

      const crawler = await prisma.aiLibraryCrawler.create({
        include: { cronJob: true },
        data: {
          ...input,
          libraryId,
          includePatterns: includePatterns ? JSON.stringify(includePatterns) : null,
          excludePatterns: excludePatterns ? JSON.stringify(excludePatterns) : null,
          allowedMimeTypes: allowedMimeTypes ? JSON.stringify(allowedMimeTypes) : null,
          crawlerConfig: parsedCrawlerConfig, // TODO: Encrypt before storing - https://github.com/progwise/george-ai/issues/876
          cronJob: cronJob ? { create: cronJob } : undefined,
        },
      })

      if (data.uriType === 'http') {
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
        await removeCrawlerCredentials(crawler.id)
      } else if (data.uriType === 'smb') {
        if (!credentials?.username || !credentials?.password) {
          throw new GraphQLError('Must provide username and password for uri type SMB')
        }
        // Store credentials for use during crawl (new SMB crawler service architecture)
        await updateCrawlerCredentials(crawler.id, credentials)
        // Clean up old SMB mount if it exists (from previous architecture)
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
      } else if (data.uriType === 'sharepoint') {
        if (!credentials?.sharepointAuth) {
          throw new GraphQLError('Must provide sharepointAuth for uri type SharePoint')
        }
        await updateCrawlerCredentials(crawler.id, credentials)
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
      } else if (data.uriType === 'box') {
        if (!credentials?.boxCustomerId || !credentials?.boxToken) {
          throw new GraphQLError('Must provide box credentials for uri type Box')
        }
        await updateCrawlerCredentials(crawler.id, credentials)
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
      } else if (data.uriType === 'api') {
        if (!crawlerConfig) {
          throw new GraphQLError('Must provide crawlerConfig for uri type API')
        }
        await ensureCrawlerSmbShareUnmount({ crawlerId: crawler.id })
        await removeCrawlerCredentials(crawler.id)
      }

      if (crawler.cronJob) {
        await upsertCronJob(crawler.cronJob)
      }

      return crawler
    },
  }),
)

builder.mutationField('updateAiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawler',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryCrawlerInput, required: true }),
      credentials: t.arg({ type: AiLibraryCrawlerCredentialsInput, required: false }),
    },
    resolve: async (query, _source, { id, data, credentials }, context) => {
      const { cronJob, includePatterns, excludePatterns, allowedMimeTypes, crawlerConfig, ...input } = data
      const existingCrawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({
        ...query,
        where: { id },
        include: { ...query.include, cronJob: true },
      })
      await canAccessLibraryOrThrow(existingCrawler?.libraryId, context.session.user.id)

      if (data.uriType === 'http') {
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
        await removeCrawlerCredentials(id)
      } else if (data.uriType === 'smb') {
        if (!credentials?.username || !credentials?.password) {
          throw new GraphQLError('Must provide username and password for uri type SMB')
        }
        // Store credentials for use during crawl (new SMB crawler service architecture)
        await updateCrawlerCredentials(id, credentials)
        // Clean up old SMB mount if it exists (from previous architecture)
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      } else if (data.uriType === 'sharepoint') {
        if (!credentials?.sharepointAuth) {
          throw new GraphQLError('Must provide sharepointAuth for uri type SharePoint')
        }
        await updateCrawlerCredentials(id, credentials)
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      } else if (data.uriType === 'box') {
        if (!credentials?.boxCustomerId || !credentials?.boxToken) {
          throw new GraphQLError('Must provide box credentials for uri type Box')
        }
        await updateCrawlerCredentials(id, credentials)
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      } else if (data.uriType === 'api') {
        if (!crawlerConfig) {
          throw new GraphQLError('Must provide crawlerConfig for uri type API')
        }
        await ensureCrawlerSmbShareUnmount({ crawlerId: id })
        await removeCrawlerCredentials(id)
      }

      // Parse crawlerConfig JSON with error handling
      let parsedCrawlerConfig = null
      if (crawlerConfig) {
        try {
          parsedCrawlerConfig = JSON.parse(crawlerConfig)
        } catch {
          throw new GraphQLError('Invalid JSON in crawlerConfig')
        }
      }

      const crawler = await prisma.aiLibraryCrawler.update({
        where: { id },
        data: {
          ...input,
          includePatterns: includePatterns ? JSON.stringify(includePatterns) : null,
          excludePatterns: excludePatterns ? JSON.stringify(excludePatterns) : null,
          allowedMimeTypes: allowedMimeTypes ? JSON.stringify(allowedMimeTypes) : null,
          crawlerConfig: parsedCrawlerConfig, // TODO: Encrypt before storing - https://github.com/progwise/george-ai/issues/876
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
      crawlerId: t.arg.string({ required: true }),
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
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawler',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { id }, context) => {
      const crawler = await prisma.aiLibraryCrawler.findUniqueOrThrow({
        where: { id },
        include: { cronJob: true, files: true },
      })
      await canAccessLibraryOrThrow(crawler.libraryId, context.session.user.id)

      await Promise.all(crawler.files.map((file) => deleteFile(file.id, file.libraryId)))
      await prisma.aiLibraryCrawler.delete({ where: { id } })
      if (crawler.cronJob) {
        await stopCronJob(crawler.cronJob)
      }

      await ensureCrawlerSmbShareUnmount({ crawlerId: id })
      await removeCrawlerCredentials(id)

      return crawler
    },
  }),
)
