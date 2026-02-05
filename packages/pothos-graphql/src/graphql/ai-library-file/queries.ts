import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../builder'
import { logger } from './common'

console.log('Setting up: AiLibraryFile Queries')

const SORT_ORDERS = ['createdAtAsc', 'createdAtDesc', 'fileNameAsc', 'fileNameDesc'] as const
type SortOrder = (typeof SORT_ORDERS)[number]
const LibraryFilesSortOrder = builder.enumType('AiLibraryFileSortOrder', {
  values: SORT_ORDERS,
})

const LibraryFileQueryResult = builder
  .objectRef<{
    libraryId: string
    take: number
    skip: number
    showArchived?: boolean
    orderBy: SortOrder
  }>('AiLibraryFileQueryResult')
  .implement({
    description: 'Query result for AI library files',
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      library: t.prismaField({
        type: 'AiLibrary',
        nullable: false,
        resolve: async (_query, root) => {
          return prisma.aiLibrary.findUniqueOrThrow({ where: { id: root.libraryId } })
        },
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      showArchived: t.exposeBoolean('showArchived', { nullable: true }),
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          return prisma.aiLibraryFile.count({
            where: {
              libraryId: root.libraryId,
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
          })
        },
      }),
      archivedCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async (root) => {
          return prisma.aiLibraryFile.count({
            where: {
              libraryId: root.libraryId,
              archivedAt: { not: null }, // Only archived files
            },
          })
        },
      }),
      storageStatus: t.withAuth({ isLoggedIn: true }).field({
        type: 'StorageStatus',
        nullable: false,
        resolve: async (root, _args, { workspaceId }) => {
          const storageStatus = await workspaceStorage.getStorageStatus(workspaceId, {
            libraryId: root.libraryId,
          })
          return storageStatus
        },
      }),
      embeddingStatus: t.withAuth({ isLoggedIn: true }).field({
        type: 'EmbeddingStatus',
        nullable: false,
        resolve: async (_root, _args, { workspaceId }) => {
          const embeddingStatus = await vectorStore.getEmbeddingStatus({
            workspaceId,
          })
          return embeddingStatus
        },
      }),
      // List of files in this library
      files: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, root) => {
          return prisma.aiLibraryFile.findMany({
            ...query,
            where: {
              libraryId: root.libraryId,
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
            orderBy:
              root.orderBy === 'createdAtAsc'
                ? { createdAt: 'asc' }
                : root.orderBy === 'createdAtDesc'
                  ? { createdAt: 'desc' }
                  : root.orderBy === 'fileNameAsc'
                    ? { name: 'asc' }
                    : { name: 'desc' },
            take: root.take ?? 10,
            skip: root.skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiLibraryFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { fileId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        return await prisma.aiLibraryFile.findFirstOrThrow({ ...query, where: { id: fileId } })
      } catch (error) {
        logger.error('Error fetching AiLibraryFile', { workspaceId, fileId, error })
        throw new GraphQLError('AiLibraryFile not found')
      }
    },
  }),
)

builder.queryField('aiLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: LibraryFileQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
      orderBy: t.arg({
        type: LibraryFilesSortOrder,
        required: false,
        defaultValue: 'createdAtDesc',
      }),
    },
    resolve: async (_root, args, context) => {
      const workspaceId = context.workspaceId
      await canReadWorkspaceOrThrow(workspaceId, context.session.user.id)
      return {
        libraryId: args.libraryId,
        take: args.take ?? 10,
        skip: args.skip ?? 0,
        showArchived: args.showArchived ?? false,
        orderBy: args.orderBy ?? 'createdAtDesc',
      }
    },
  }),
)

builder.queryField('checkFileExistsByOriginUri', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder.objectRef<{ count: number; originUriPrefix: string }>('CheckFileExistsByOriginUriResult').implement({
      description: 'Result of checking for files by origin URI prefix',
      fields: (t) => ({
        count: t.exposeInt('count', { nullable: false }),
        originUriPrefix: t.exposeString('originUriPrefix', { nullable: false }),
      }),
    }),
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      originUriPrefix: t.arg.string({ required: true }),
    },
    resolve: async (_root, { libraryId, originUriPrefix }, context) => {
      const workspaceId = context.workspaceId
      await canReadWorkspaceOrThrow(workspaceId, context.session.user.id)
      const count = await prisma.aiLibraryFile.count({
        where: {
          libraryId,
          originUri: { startsWith: originUriPrefix },
        },
      })
      return { count, originUriPrefix }
    },
  }),
)
