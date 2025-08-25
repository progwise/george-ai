import fs from 'fs'
import path from 'path'

import { getFileDir } from '@george-ai/file-management'

import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const FileContentResult = builder.objectRef<{
  content: string
  success: boolean
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
  t.withAuth({ isLoggedIn: true }).field({
    type: FileContentResult,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      conversionId: t.arg.string({ required: false }),
    },
    resolve: async (_source, { fileId, conversionId }, context) => {
      console.log(`Reading markdown file for fileId ${fileId}`, { conversionId })

      const fileRecord = await prisma.aiLibraryFile.findUniqueOrThrow({
        where: { id: fileId },
        select: { id: true, libraryId: true },
      })

      await canAccessLibraryOrThrow(fileRecord.libraryId, context.session.user.id)

      const conversion = await prisma.aiLibraryFileConversion.findFirst({
        where: { ...(conversionId ? { id: conversionId } : { success: true }) },
        orderBy: { createdAt: 'desc' },
      })

      const isLegacyFile = !conversion
      let fileContent: string | null = null
      if (isLegacyFile) {
        // Handle legacy files without conversion records
        const legacyFilePath = path.resolve(getFileDir({ fileId, libraryId: fileRecord.libraryId }), 'converted.md')
        if (!fs.existsSync(legacyFilePath)) {
          throw new Error(`Legacy file does not exist at path: ${legacyFilePath}`)
        }
        fileContent = await fs.promises.readFile(legacyFilePath, 'utf-8')
      } else {
        const filePath = path.resolve(getFileDir({ fileId, libraryId: fileRecord.libraryId }), conversion!.fileName)
        fileContent = await fs.promises.readFile(filePath, 'utf-8')
      }

      // Return structured result
      return {
        content: fileContent,
        success: conversion?.success ?? true, // Legacy files assumed successful
        hasTimeout: conversion?.hasTimeout ?? false,
        hasPartialResult: conversion?.hasPartialResult ?? false,
        hasUnsupportedFormat: conversion?.hasUnsupportedFormat ?? false,
        hasConversionError: conversion?.hasConversionError ?? false,
        hasLegacyFormat: conversion?.hasLegacyFormat ?? false,
        isLegacyFile,
        fileName: conversion?.fileName ?? 'converted.md',
        processingTimeMs: conversion?.processingTimeMs ?? undefined,
        metadata: conversion?.metadata ?? undefined,
      }
    },
  }),
)
