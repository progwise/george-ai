import { prisma } from '@george-ai/app-domain'

import { canAccessLibraryOrThrow } from '../../domain'
import { ProcessingStatus, getTaskStatusWhereClause } from '../../domain/content-extraction/task-status'
import { builder } from '../builder'

console.log('Setting up: AiFileContentExtractionTask Queries')

const ContentExtractionTaskQueryResult = builder
  .objectRef<{
    libraryId: string
    fileId?: string
    status?: ProcessingStatus
    take: number
    skip: number
  }>('ContentExtractionTaskQueryResult')
  .implement({
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      fileId: t.exposeString('fileId', { nullable: true }),
      status: t.field({
        type: 'ProcessingStatus',
        nullable: true,
        resolve: ({ status }) => status,
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async ({ libraryId, fileId, status }) => {
          return prisma.aiContentProcessingTask.count({
            where: {
              libraryId,
              ...(fileId ? { fileId } : {}),
              ...(status ? getTaskStatusWhereClause(status) : {}),
            },
          })
        },
      }),
      statusCounts: t.field({
        type: [
          builder.objectRef<{ status: ProcessingStatus; count: number }>('ProcessingTaskStateCount').implement({
            fields: (t) => ({
              status: t.expose('status', { type: 'ProcessingStatus', nullable: false }),
              count: t.exposeInt('count', { nullable: false }),
            }),
          }),
        ],
        nullable: false,
        description: 'Counts of tasks in each processing state',
        resolve: async ({ libraryId, fileId }) => {
          return [
            {
              status: 'pending' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('pending'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'validating' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('validating'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'extracting' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('extracting'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'embedding' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('embedding'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'completed' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('completed'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'failed' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('failed'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'cancelled' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('cancelled'), ...(fileId ? { fileId } : {}) },
              }),
            },
            {
              status: 'timedOut' as const,
              count: await prisma.aiContentProcessingTask.count({
                where: { libraryId, ...getTaskStatusWhereClause('timedOut'), ...(fileId ? { fileId } : {}) },
              }),
            },
          ]
        },
      }),
      tasks: t.prismaField({
        type: ['AiContentProcessingTask'],
        nullable: { list: false, items: false },
        resolve: (query, { libraryId, fileId, take, skip, status }) => {
          return prisma.aiContentProcessingTask.findMany({
            ...query,
            where: {
              libraryId,
              ...(fileId ? { fileId } : {}),
              ...(status ? getTaskStatusWhereClause(status) : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: take ?? 20,
            skip: skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiContentProcessingTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ContentExtractionTaskQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: false }),
      status: t.arg({ type: 'ProcessingStatus', required: false }),
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
