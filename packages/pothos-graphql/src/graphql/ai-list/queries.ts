import { prisma } from '../../prisma'
import { builder } from '../builder'
import { canAccessListOrThrow } from './utils'

console.log('Setting up: AiList queries')

builder.queryField('aiLists', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiList'],
    nullable: false,
    resolve: async (query, _source, _args, context) => {
      const user = context.session.user
      return prisma.aiList.findMany({
        ...query,
        where: {
          OR: [
            { ownerId: user.id },
            {
              participants: { some: { userId: user.id } },
            },
          ],
        },
        orderBy: { name: 'asc' },
      })
    },
  }),
)

builder.queryField('aiList', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiList',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      const list = await prisma.aiList.findFirstOrThrow({ ...query, include: { participants: true }, where: { id } })
      canAccessListOrThrow(list, context.session.user)
      return list
    },
  }),
)

const ListFilesQueryResult = builder
  .objectRef<{
    listId: string
    take: number
    skip: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    showArchived?: boolean
  }>('AiListFilesQueryResult')
  .implement({
    description: 'Query result for AI list files from all source libraries',
    fields: (t) => ({
      listId: t.exposeString('listId', { nullable: false }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      orderBy: t.exposeString('orderBy', { nullable: true }),
      orderDirection: t.exposeString('orderDirection', { nullable: true }),
      showArchived: t.exposeBoolean('showArchived', { nullable: true }),
      count: t.withAuth({ isLoggedIn: true }).field({
        type: 'Int',
        nullable: false,
        resolve: async (root, _args, context) => {
          const list = await prisma.aiList.findFirstOrThrow({
            where: { id: root.listId },
            include: { participants: true, sources: true },
          })
          canAccessListOrThrow(list, context.session.user)

          const libraryIds = list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null)
          if (libraryIds.length === 0) return 0

          return prisma.aiLibraryFile.count({
            where: {
              libraryId: { in: libraryIds },
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
          })
        },
      }),
      files: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, root, _args, context) => {
          const list = await prisma.aiList.findFirstOrThrow({
            where: { id: root.listId },
            include: { participants: true, sources: true },
          })
          canAccessListOrThrow(list, context.session.user)

          const libraryIds = list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null)
          if (libraryIds.length === 0) return []

          let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' }
          if (root.orderBy && root.orderDirection) {
            orderBy = { [root.orderBy]: root.orderDirection }
          }

          return prisma.aiLibraryFile.findMany({
            ...query,
            where: {
              libraryId: { in: libraryIds },
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
            orderBy,
            take: root.take ?? 20,
            skip: root.skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiListFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ListFilesQueryResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
      orderBy: t.arg.string({ required: false }),
      orderDirection: t.arg.string({ required: false }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: (_root, args) => {
      return {
        listId: args.listId,
        take: args.take ?? 20,
        skip: args.skip ?? 0,
        orderBy: args.orderBy ?? undefined,
        orderDirection: args.orderDirection === 'desc' ? ('desc' as const) : ('asc' as const),
        showArchived: args.showArchived ?? false,
      }
    },
  }),
)

builder.queryField('aiListEnrichmentQueue', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiListEnrichmentQueue'],
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      status: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { listId, status }, context) => {
      const list = await prisma.aiList.findFirstOrThrow({
        where: { id: listId },
        include: { participants: true },
      })
      canAccessListOrThrow(list, context.session.user)

      return prisma.aiListEnrichmentQueue.findMany({
        ...query,
        where: {
          listId,
          ...(status ? { status } : {}),
        },
        orderBy: [
          { status: 'asc' }, // processing first, then pending, then completed/failed
          { priority: 'desc' },
          { requestedAt: 'asc' },
        ],
      })
    },
  }),
)
