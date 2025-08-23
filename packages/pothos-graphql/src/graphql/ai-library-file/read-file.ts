import fs from 'fs'

import { getLatestMarkdownFilePath } from '@george-ai/file-management'

import { prisma } from '../../prisma'
import { builder } from '../builder'

const FileContentResult = builder.objectRef<{
  content: string
  success: boolean
  hasEndlessLoop: boolean
  hasTimeout: boolean
  hasPartialResult: boolean
  hasUnsupportedFormat: boolean
  hasConversionError: boolean
  hasLegacyFormat: boolean
  isLegacyFile: boolean
  fileName: string
  processingTimeMs?: number
  metadata?: string
}>('FileContentResult')

builder.objectType(FileContentResult, {
  fields: (t) => ({
    content: t.exposeString('content'),
    success: t.exposeBoolean('success'),
    hasEndlessLoop: t.exposeBoolean('hasEndlessLoop'),
    hasTimeout: t.exposeBoolean('hasTimeout'),
    hasPartialResult: t.exposeBoolean('hasPartialResult'),
    hasUnsupportedFormat: t.exposeBoolean('hasUnsupportedFormat'),
    hasConversionError: t.exposeBoolean('hasConversionError'),
    hasLegacyFormat: t.exposeBoolean('hasLegacyFormat'),
    isLegacyFile: t.exposeBoolean('isLegacyFile'),
    fileName: t.exposeString('fileName'),
    processingTimeMs: t.exposeInt('processingTimeMs', { nullable: true }),
    metadata: t.exposeString('metadata', { nullable: true }),
  }),
})

builder.queryField('readFileMarkdown', (t) =>
  t.field({
    type: FileContentResult,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId }) => {
      console.log(`Reading markdown file for fileId ${fileId}`)

      try {
        // Get the latest file path (includes legacy fallback)
        const path = await getLatestMarkdownFilePath({ fileId, libraryId })

        if (!path) {
          throw new Error(`No markdown file found for fileId ${fileId}`)
        }

        const fileContent = await fs.promises.readFile(path, 'utf-8')
        const fileName = path.split('/').pop() || 'unknown'
        const isLegacyFile = fileName === 'converted.md'

        // Get conversion attempt metadata from database
        const conversionAttempt = await prisma.aiFileConversionAttempt.findFirst({
          where: {
            fileId,
            fileName,
          },
          orderBy: {
            createdAt: 'desc',
          },
        })

        // Data integrity check: timestamped files must have database records
        if (!isLegacyFile && !conversionAttempt) {
          throw new Error(
            `Data integrity error: Found timestamped file ${fileName} without database record for fileId ${fileId}`,
          )
        }

        // Return structured result
        return {
          content: fileContent,
          success: conversionAttempt?.success ?? true, // Legacy files assumed successful
          hasEndlessLoop: conversionAttempt?.hasEndlessLoop ?? false,
          hasTimeout: conversionAttempt?.hasTimeout ?? false,
          hasPartialResult: conversionAttempt?.hasPartialResult ?? false,
          hasUnsupportedFormat: conversionAttempt?.hasUnsupportedFormat ?? false,
          hasConversionError: conversionAttempt?.hasConversionError ?? false,
          hasLegacyFormat: conversionAttempt?.hasLegacyFormat ?? false,
          isLegacyFile,
          fileName,
          processingTimeMs: conversionAttempt?.processingTimeMs ?? undefined,
          metadata: conversionAttempt?.metadata ?? undefined,
        }
      } catch (error) {
        console.error(`Error reading file ${fileId}:`, error)
        throw new Error(`Failed to read file ${fileId}: ${(error as Error).message}`)
      }
    },
  }),
)
