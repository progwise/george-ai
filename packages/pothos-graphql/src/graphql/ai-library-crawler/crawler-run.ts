import { prisma } from '@george-ai/app-database'

import { builder } from '../builder'

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
