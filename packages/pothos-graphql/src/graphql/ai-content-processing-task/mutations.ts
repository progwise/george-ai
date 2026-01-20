import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-domain'

import { createContentProcessingTask } from '../../domain/content-extraction/content-extraction-task'
import { builder } from '../builder'
import { canWriteWorkspaceOrThrow } from '../workspace'

console.log('Setting up: AiFileContentExtractionTask Mutations')

// Create content extraction tasks for a file (replaces old synchronous processFile)
builder.mutationField('createContentProcessingTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiContentProcessingTask',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { fileId, libraryId }, context) => {
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)
      // Check permissions
      try {
        // Create default extraction tasks for this file
        const tasks = await createContentProcessingTask({
          fileId,
          query,
          libraryId: libraryId,
        })

        return tasks
      } catch (error) {
        throw new GraphQLError(error instanceof Error ? error.message : String(error))
      }
    },
  }),
)

builder.mutationField('cancelProcessingTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiContentProcessingTask',
    nullable: false,
    args: {
      taskId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { taskId, libraryId }, context) => {
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)

      const task = await prisma.aiContentProcessingTask.update({
        where: { id: taskId, libraryId },
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
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)

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
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)

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
