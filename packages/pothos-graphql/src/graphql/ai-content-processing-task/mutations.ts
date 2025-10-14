import { GraphQLError } from 'graphql'

import { canAccessLibraryOrThrow } from '../../domain'
import {
  createContentProcessingTask,
  createEmbeddingOnlyTask,
} from '../../domain/content-extraction/content-extraction-task'
import { canAccessFileOrThrow } from '../../domain/file'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiFileContentExtractionTask Mutations')

// Create content extraction tasks for a file (replaces old synchronous processFile)
builder.mutationField('createContentProcessingTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiContentProcessingTask',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { fileId }, context) => {
      // Check permissions
      const file = await canAccessFileOrThrow(fileId, context.session.user.id)

      try {
        // Create default extraction tasks for this file
        const tasks = await createContentProcessingTask({
          fileId,
          query,
          libraryId: file.libraryId,
        })

        return tasks
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : String(error))
      }
    },
  }),
)

// Create embedding-only task using existing markdown (replaces old synchronous embedFile)
builder.mutationField('createEmbeddingTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiContentProcessingTask',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      existingTaskId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, { fileId, existingTaskId }, context) => {
      // Check permissions
      await canAccessFileOrThrow(fileId, context.session.user.id)

      // Create embedding-only task
      const task = await createEmbeddingOnlyTask(fileId, { existingTaskId, query })

      return task
    },
  }),
)

builder.mutationField('cancelProcessingTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiContentProcessingTask',
    nullable: false,
    args: {
      taskId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { taskId, fileId }, context) => {
      // Check permissions
      await canAccessFileOrThrow(fileId, context.session.user.id)

      // Create embedding-only task
      const task = await prisma.aiContentProcessingTask.update({
        where: { id: taskId },
        data: { processingCancelled: true },
        ...query,
      })

      return task
    },
  }),
)

builder.mutationField('createMissingContentExtractionTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiContentProcessingTask'],
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { libraryId }, context) => {
      // Check permissions
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)

      const files = await prisma.aiLibraryFile.findMany({
        where: {
          libraryId,
          contentExtractionTasks: {
            none: {
              OR: [{ chunksCount: { gt: 0 }, processingFinishedAt: { not: null } }, { processingStartedAt: null }],
            },
          },
        },
      })

      const createTaskPromises = files.map((file) =>
        createContentProcessingTask({
          fileId: file.id,
          query,
          libraryId: file.libraryId,
        }),
      )
      const tasks = (await Promise.all(createTaskPromises)).flat()
      return tasks
    },
  }),
)

builder.mutationField('dropPendingTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }, context) => {
      // Check permissions
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)

      const result = await prisma.aiContentProcessingTask.deleteMany({
        where: {
          libraryId,
          processingStartedAt: null,
        },
      })
      return result.count
    },
  }),
)
