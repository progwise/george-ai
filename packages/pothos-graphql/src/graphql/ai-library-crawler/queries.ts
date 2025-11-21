import { createShopwareConfig, createWeclappConfig, genericRestTemplate } from '@george-ai/api-crawler'

import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

// API Crawler Template type for UI
const ApiCrawlerTemplate = builder.simpleObject('ApiCrawlerTemplate', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    name: t.string({ nullable: false }),
    description: t.string({ nullable: false }),
    config: t.string({ nullable: false }),
  }),
})

builder.queryField('apiCrawlerTemplates', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ApiCrawlerTemplate],
    nullable: { list: false, items: false },
    resolve: () => [
      {
        id: 'shopware',
        name: 'Shopware 6',
        description: 'E-commerce platform - fetches products via REST API with OAuth2 authentication',
        config: JSON.stringify(
          createShopwareConfig({
            baseUrl: 'https://your-shop.shopware.store',
            clientId: 'your-client-id',
            clientSecret: 'your-client-secret',
          }),
          null,
          2,
        ),
      },
      {
        id: 'weclapp',
        name: 'Weclapp ERP',
        description: 'ERP system - fetches articles via REST API with Bearer token authentication',
        config: JSON.stringify(
          createWeclappConfig({
            baseUrl: 'https://your-tenant.weclapp.com',
            token: 'your-api-token',
          }),
          null,
          2,
        ),
      },
      {
        id: 'custom',
        name: 'Custom REST API',
        description: 'Generic template for any REST API - customize all settings',
        config: JSON.stringify(
          {
            ...genericRestTemplate,
            baseUrl: 'https://api.example.com',
            endpoint: '/items',
            dataPath: 'data',
            authType: 'bearer',
            authConfig: { token: 'your-api-key' },
            paginationType: 'page',
            paginationConfig: { pageParam: 'page', pageSizeParam: 'limit', defaultPageSize: 50 },
          },
          null,
          2,
        ),
      },
    ],
  }),
)

builder.queryField('aiLibraryCrawler', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawler',
    nullable: false,
    args: {
      crawlerId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { crawlerId, libraryId }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      return prisma.aiLibraryCrawler.findFirstOrThrow({
        ...query,
        where: { id: crawlerId, libraryId },
      })
    },
  }),
)

builder.queryField('aiLibraryCrawlerRun', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryCrawlerRun',
    nullable: false,
    args: {
      crawlerRunId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { crawlerRunId, libraryId }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      return await prisma.aiLibraryCrawlerRun.findFirstOrThrow({
        ...query,
        where: { id: crawlerRunId, crawler: { libraryId } },
      })
    },
  }),
)

const AiLibraryCrawlerRunQueryResults = builder
  .objectRef<{
    libraryId: string
    crawlerId?: string
    skip: number
    take: number
  }>('LibraryCrawlerRunQueryResults')
  .implement({
    fields: (t) => ({
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          return prisma.aiLibraryCrawlerRun.count({
            where: { crawler: { libraryId: root.libraryId }, ...(root.crawlerId ? { crawlerId: root.crawlerId } : {}) },
          })
        },
      }),
      runs: t.prismaField({
        type: ['AiLibraryCrawlerRun'],
        nullable: false,
        resolve: async (query, root) => {
          return await prisma.aiLibraryCrawlerRun.findMany({
            ...query,
            where: { crawler: { libraryId: root.libraryId }, ...(root.crawlerId ? { crawlerId: root.crawlerId } : {}) },
            orderBy: { startedAt: 'desc' },
            take: root.take,
            skip: root.skip,
          })
        },
      }),
    }),
  })

builder.queryField('aiLibraryCrawlerRuns', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: AiLibraryCrawlerRunQueryResults,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      crawlerId: t.arg.string({ required: false }),
      skip: t.arg.int({ required: false, defaultValue: 0 }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
    },
    resolve: async (_parent, { libraryId, crawlerId, skip, take }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      return { libraryId, crawlerId: crawlerId ?? undefined, skip: skip ?? 0, take: take ?? 20 }
    },
  }),
)
