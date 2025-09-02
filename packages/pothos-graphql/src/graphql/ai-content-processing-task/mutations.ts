import {
  createContentProcessingTask,
  createEmbeddingOnlyTask,
} from '../../domain/content-extraction/content-extraction-task'
import { canAccessFileOrThrow } from '../../domain/file'
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

      // Create default extraction tasks for this file
      const tasks = await createContentProcessingTask({
        fileId,
        query,
        libraryId: file.libraryId,
      })

      return tasks
    },
  }),
)

// Create embedding-only task using existing markdown (replaces old synchronous embedFile)
builder.mutationField('createEmbeddingOnlyProcessingTask', (t) =>
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
