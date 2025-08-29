import fs from 'fs'
import path from 'path'

import { getFileDir } from '@george-ai/file-management'

import { canAccessFileOrThrow } from '../../domain/file'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile ReadFile')

const FileContentResult = builder.objectRef<{
  timeoutMs: number | null
  extractionOptions: string | null
  embeddingModelName: string | null
  markdown: string
  success: boolean
  processingTimeout: boolean
  extractionError: boolean
  isLegacyFile: boolean
  fileName: string
  processingFinishedAt?: Date
  extractionTimeMs: number | undefined
  embeddingTimeMs?: number | undefined
  processingTimeMs?: number | undefined
  metadata?: string | undefined
}>('FileContentResult')

builder.objectType(FileContentResult, {
  fields: (t) => ({
    timeoutMs: t.exposeInt('timeoutMs', { nullable: true }),
    extractionOptions: t.exposeString('extractionOptions', { nullable: true }),
    embeddingModelName: t.exposeString('embeddingModelName', { nullable: true }),
    markdown: t.exposeString('markdown'),
    success: t.exposeBoolean('success'),
    processingTimeout: t.exposeBoolean('processingTimeout'),
    extractionError: t.exposeBoolean('extractionError'),
    isLegacyFile: t.exposeBoolean('isLegacyFile'),
    fileName: t.exposeString('fileName'),
    extractionTimeMs: t.exposeInt('extractionTimeMs', { nullable: true }),
    embeddingTimeMs: t.exposeInt('embeddingTimeMs', { nullable: true }),
    processingTimeMs: t.exposeInt('processingTimeMs', { nullable: true }),
    metadata: t.exposeString('metadata', { nullable: true }),
  }),
})

builder.queryField('readFileMarkdown', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: FileContentResult,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      extractionTaskId: t.arg.string({ required: false }),
    },
    resolve: async (_source, { fileId, extractionTaskId }, context) => {
      console.log(`Reading markdown file for fileId ${fileId} from extraction task ${extractionTaskId}`)

      const fileRecord = await canAccessFileOrThrow(fileId, context.session.user.id)

      const task = await prisma.aiFileContentExtractionTask.findFirst({
        where: {
          fileId: fileRecord.id,
          ...(extractionTaskId
            ? { id: extractionTaskId }
            : { processingFinishedAt: { not: null }, extractionFailedAt: null }),
        },
        orderBy: { extractionStartedAt: 'desc' },
      })

      const isLegacyFile = !task
      let markdown: string | null = null
      if (isLegacyFile) {
        // Handle legacy files without conversion records
        const legacyFilePath = path.resolve(getFileDir({ fileId, libraryId: fileRecord.libraryId }), 'converted.md')
        if (!fs.existsSync(legacyFilePath)) {
          throw new Error(`Legacy file does not exist at path: ${legacyFilePath}`)
        }
        markdown = await fs.promises.readFile(legacyFilePath, 'utf-8')
      } else {
        const filePath = path.resolve(getFileDir({ fileId, libraryId: fileRecord.libraryId }), task!.markdownFileName!)
        markdown = await fs.promises.readFile(filePath, 'utf-8')
      }

      // Return structured result
      return {
        timeoutMs: task?.timeoutMs ?? null,
        extractionOptions: task?.extractionOptions ?? null,
        embeddingModelName: task?.embeddingModelName ?? null,
        markdown,
        success: task?.extractionFinishedAt !== null, // Success if finished without error
        processingTimeout: task?.processingTimeout !== null,
        extractionError: task?.extractionFailedAt !== null,
        isLegacyFile,
        fileName: task?.markdownFileName ?? 'converted.md',
        processingFinishedAt: task?.processingFinishedAt ?? undefined,
        extractionTimeMs:
          task?.extractionStartedAt && task?.extractionFinishedAt
            ? task.extractionFinishedAt.getTime() - task.extractionStartedAt.getTime()
            : undefined,
        embeddingTimeMs:
          task?.embeddingStartedAt && task?.embeddingFinishedAt
            ? task.embeddingFinishedAt.getTime() - task.embeddingStartedAt.getTime()
            : undefined,
        processingTimeMs:
          task?.processingFinishedAt && task?.processingStartedAt
            ? task.processingFinishedAt.getTime() - task.processingStartedAt.getTime()
            : undefined,
        metadata: task?.metadata ?? '{}',
      }
    },
  }),
)
