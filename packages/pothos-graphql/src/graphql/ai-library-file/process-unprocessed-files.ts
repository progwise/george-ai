import fs from 'node:fs'

import { getMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { convertUploadToMarkdown } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import {
  addToQueue,
  checkNewFilesToProcess,
  cleanUpQueue,
  processingQueue,
  removeIdFromQueue,
} from './processing-queue'

const processUnprocessedFiles = async (libraryId: string) => {
  const newFilesToProcess = await checkNewFilesToProcess(libraryId)
  cleanUpQueue(libraryId)

  if (newFilesToProcess.length === 0) {
    console.log('No new files to process.')
    return
  }

  addToQueue(
    libraryId,
    newFilesToProcess.map((file) => file.id),
  )
  let successfulCount = 0

  await Promise.allSettled(
    newFilesToProcess.map(async (file) => {
      try {
        if (!file.library.embeddingModelName) {
          throw new Error(`Embedding model not found for library: ${file.libraryId}`)
        }
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

        if (fs.existsSync(uploadFilePath)) {
          // re-generate markdown
          await convertUploadToMarkdown(file.id, {
            removeUploadFile: false,
            fileConverterOptions: file.library.fileConverterOptions || '',
          })
        }
        const embeddedFile = await embedFile(file.libraryId, file.library.embeddingModelName, {
          id: file.id,
          name: file.name,
          originUri: file.originUri!,
          mimeType: file.mimeType,
          path: markdownFilePath,
        })

        await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            ...embeddedFile,
            processedAt: new Date(),
            processingEndedAt: new Date(),
            processingErrorAt: null,
            processingErrorMessage: null,
          },
        })
        successfulCount++
        removeIdFromQueue(libraryId, [file.id])
        return
      } catch (error) {
        console.error(`Error processing file ${file.id}:`, error)
        const failedFile = await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            processingErrorAt: new Date(),
            processingErrorMessage: (error as Error).message,
          },
        })
        removeIdFromQueue(libraryId, [file.id])
        return failedFile
      }
    }),
  )

  await cleanUpQueue(libraryId)
  const totalIds = newFilesToProcess.map((file) => file.id)
  return { totalProcessedCount: totalIds.length, processedCount: successfulCount }
}

export const getUnprocessedFiles = async (libraryId: string) => {
  return prisma.aiLibraryFile.findMany({
    where: {
      libraryId,
      processedAt: null,
    },
    select: {
      libraryId: true,
      id: true,
      name: true,
      originUri: true,
      mimeType: true,
      library: { select: { id: true, name: true, embeddingModelName: true, fileConverterOptions: true } },
    },
  })
}

builder.queryField('unprocessedFilesInQueueCount', (t) =>
  t.withAuth({ isLoggedIn: true }).int({
    nullable: false,
    resolve: () => {
      const queue: Record<string, string[]> = processingQueue ?? {}
      return Object.values(queue).reduce<number>((total, fileIds) => total + (fileIds?.length ?? 0), 0)
    },
  }),
)

builder.mutationField('processUnprocessedFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).intList({
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_root, args) => {
      const results = (await processUnprocessedFiles(args.libraryId)) ?? { totalProcessedCount: 0, processedCount: 0 }
      const totalProcessedCount = results.totalProcessedCount
      const successfulCount = results.processedCount
      return [totalProcessedCount, successfulCount]
    },
  }),
)
