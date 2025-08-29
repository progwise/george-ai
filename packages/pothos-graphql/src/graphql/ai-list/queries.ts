import { canAccessListOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

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
      await canAccessListOrThrow(id, context.session.user.id)
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
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          const list = await prisma.aiList.findFirstOrThrow({
            where: { id: root.listId },
            include: { sources: true },
          })
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
      files: t.prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, root) => {
          const list = await prisma.aiList.findFirstOrThrow({
            where: { id: root.listId },
            include: { sources: true, fields: true },
          })

          const libraryIds = list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null)
          if (libraryIds.length === 0) return []

          // Check if orderBy is a computed field ID
          const isComputedFieldSort =
            root.orderBy &&
            list.fields.some((field) => field.id === root.orderBy && field.sourceType === 'llm_computed')

          if (isComputedFieldSort && root.orderBy && root.orderDirection) {
            // For computed field sorting, use raw SQL to get sorted file IDs only
            const fieldId = root.orderBy
            const direction = root.orderDirection.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'

            // Step 1: Use raw SQL to get sorted file IDs
            const sortedFileIds = await prisma.$queryRawUnsafe<{ id: string }[]>(
              `
              SELECT f.id
              FROM "AiLibraryFile" f
              LEFT JOIN "AiListItemCache" c ON f.id::text = c."fileId" AND c."fieldId" = $1
              WHERE f."libraryId" = ANY($2::text[])
                AND ($3::boolean OR f."archivedAt" IS NULL)
              ORDER BY c."valueString" ${direction} NULLS LAST, f.name ASC
              LIMIT $4
              OFFSET $5
            `,
              fieldId,
              libraryIds,
              root.showArchived ?? false,
              root.take ?? 20,
              root.skip ?? 0,
            )

            if (sortedFileIds.length === 0) return []

            // Step 2: Get full file records using Prisma with proper typing
            const files = await prisma.aiLibraryFile.findMany({
              ...query,
              where: {
                id: { in: sortedFileIds.map((f) => f.id) },
              },
            })

            // Step 3: Sort the files manually to preserve the order from SQL query
            const fileMap = new Map(files.map((f) => [f.id, f]))
            return sortedFileIds.map(({ id }) => fileMap.get(id)).filter(Boolean) as typeof files
          } else {
            // Standard file property sorting
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
          }
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
    resolve: async (_root, args, context) => {
      await canAccessListOrThrow(args.listId, context.session.user.id)

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
      await canAccessListOrThrow(listId, context.session.user.id)

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
