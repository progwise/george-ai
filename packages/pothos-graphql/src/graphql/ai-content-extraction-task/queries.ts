import { canAccessLibraryOrThrow } from '../../domain'
import { getTaskStatusWhereClause } from '../../domain/content-extraction/task-status-filters'
import { ProcessingStatus } from '../../domain/content-extraction/types'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiFileContentExtractionTask Queries')

const ContentExtractionTaskQueryResult = builder
  .objectRef<{
    libraryId: string
    fileId?: string
    status?: string
    take: number
    skip: number
  }>('ContentExtractionTaskQueryResult')
  .implement({
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      fileId: t.exposeString('fileId', { nullable: true }),
      status: t.exposeString('status', { nullable: true }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async ({ libraryId, fileId, status }) => {
          return prisma.aiFileContentExtractionTask.count({
            where: {
              libraryId,
              ...(fileId ? { fileId } : {}),
              ...(status ? getTaskStatusWhereClause(status as ProcessingStatus) : {}),
            },
          })
        },
      }),
      tasks: t.prismaField({
        type: ['AiFileContentExtractionTask'],
        nullable: { list: false, items: false },
        resolve: (query, { libraryId, fileId, take, skip, status }) => {
          return prisma.aiFileContentExtractionTask.findMany({
            ...query,
            where: {
              libraryId,
              ...(fileId ? { fileId } : {}),
              ...(status ? getTaskStatusWhereClause(status as ProcessingStatus) : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: take ?? 20,
            skip: skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiContentExtractionTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ContentExtractionTaskQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: false }),
      status: t.arg.string({ required: false }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
      skip: t.arg.int({ required: false, defaultValue: 0 }),
    },
    resolve: async (_parent, args, context) => {
      // Check permissions
      await canAccessLibraryOrThrow(args.libraryId, context.session.user.id)

      return {
        libraryId: args.libraryId,
        fileId: args.fileId || undefined,
        status: args.status || undefined,
        take: args.take ?? 20,
        skip: args.skip ?? 0,
      }
    },
  }),
)
