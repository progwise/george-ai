import fs from 'node:fs'

import { getMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { convertUploadToMarkdown } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

export const processFile = async (fileId: string) => {
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  if (!file) {
    throw new Error(`File not found in database: ${fileId}`)
  }

  await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      processedAt: null,
      processingStartedAt: new Date(),
      processingErrorAt: null,
      processingErrorMessage: null,
    },
  })

  const markdownFilePath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId })
  const uploadFilePath = getUploadFilePath({ fileId: file.id, libraryId: file.libraryId })

  try {
    if (fs.existsSync(uploadFilePath)) {
      // re-generate markdown
      await convertUploadToMarkdown(file.id, { removeUploadFile: false })
    }
    const embeddedFile = await embedFile(file.libraryId, {
      id: file.id,
      name: file.name,
      originUri: file.originUri!,
      mimeType: file.mimeType, // Use markdown mimetype for re-processing
      path: markdownFilePath,
    })

    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        ...embeddedFile,
        processedAt: new Date(),
        processingEndedAt: new Date(),
        processingErrorAt: null,
        processingErrorMessage: null,
      },
    })
  } catch (error) {
    console.error(`Error processing file ${fileId}:`, error)
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingErrorAt: new Date(),
        processingErrorMessage: (error as Error).message,
      },
    })
  }
}

builder.mutationField('processFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { fileId }) => processFile(fileId),
  }),
)

export const processUnprocessedFiles = async (libraryId: string) => {
  const unprocessedFiles = await getUnprocessedFiles(libraryId)

  await Promise.allSettled(
    unprocessedFiles.map(async (file) => {
      await prisma.aiLibraryFile.update({
        where: { id: file.id },
        data: {
          processedAt: null,
          processingStartedAt: new Date(),
          processingErrorAt: null,
          processingErrorMessage: null,
        },
      })

      const markdownFilePath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId })
      const uploadFilePath = getUploadFilePath({ fileId: file.id, libraryId: file.libraryId })

      try {
        if (fs.existsSync(uploadFilePath)) {
          // re-generate markdown
          await convertUploadToMarkdown(file.id, { removeUploadFile: false })
        }
        const embeddedFile = await embedFile(file.libraryId, {
          id: file.id,
          name: file.name,
          originUri: file.originUri!,
          mimeType: file.mimeType,
          path: markdownFilePath,
        })

        return await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            ...embeddedFile,
            processedAt: new Date(),
            processingEndedAt: new Date(),
            processingErrorAt: null,
            processingErrorMessage: null,
          },
        })
      } catch (error) {
        console.error(`Error processing file ${file.id}:`, error)
        return await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            processingErrorAt: new Date(),
            processingErrorMessage: (error as Error).message,
          },
        })
      }
    }),
  )
}

const getUnprocessedFiles = async (libraryId: string) => {
  //skip files that started processing up to 120 seconds ago
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

  return prisma.aiLibraryFile.findMany({
    where: {
      libraryId,
      processedAt: null,
      OR: [{ processingStartedAt: null }, { processingStartedAt: { lt: twoMinutesAgo } }],
    },
  })
}

export const countUnprocessedFiles = async (libraryId: string) => {
  //skip files that started processing up to 120 seconds ago
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

  return prisma.aiLibraryFile.count({
    where: {
      libraryId,
      processedAt: null,
      OR: [{ processingStartedAt: null }, { processingStartedAt: { lt: twoMinutesAgo } }],
    },
  })
}

builder.queryField('unprocessedFileCount', (t) =>
  t.withAuth({ isLoggedIn: true }).int({
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      return countUnprocessedFiles(args.libraryId)
    },
  }),
)

builder.mutationField('processUnprocessedFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).stringList({
    nullable: true,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      await processUnprocessedFiles(args.libraryId)
      return null
    },
  }),
)
