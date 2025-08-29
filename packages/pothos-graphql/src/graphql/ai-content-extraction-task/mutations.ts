import {
  createDefaultExtractionTasksForFile,
  createEmbeddingOnlyTask,
} from '../../domain/content-extraction/content-extraction-task'
import { canAccessFileOrThrow } from '../../domain/file'
import { builder } from '../builder'

console.log('Setting up: AiFileContentExtractionTask Mutations')

// Create content extraction tasks for a file (replaces old synchronous processFile)
builder.mutationField('createContentExtractionTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiFileContentExtractionTask'],
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { fileId }, context) => {
      // Check permissions
      await canAccessFileOrThrow(fileId, context.session.user.id)

      // Create default extraction tasks for this file
      const tasks = await createDefaultExtractionTasksForFile(fileId)

      return tasks
    },
  }),
)

// Create embedding-only task using existing markdown (replaces old synchronous embedFile)
builder.mutationField('createEmbeddingOnlyTask', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiFileContentExtractionTask',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      existingTaskId: t.arg.string({ required: false }),
    },
    resolve: async (query, _parent, { fileId, existingTaskId }, context) => {
      // Check permissions
      await canAccessFileOrThrow(fileId, context.session.user.id)

      // Create embedding-only task
      const task = await createEmbeddingOnlyTask(fileId, existingTaskId || undefined)

      return task
    },
  }),
)
