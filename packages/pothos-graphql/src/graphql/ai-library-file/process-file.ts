import fs from 'node:fs'

import { getMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { convertUploadToMarkdown } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

export const processFile = async (fileId: string) => {
  const file = await prisma.aiLibraryFile.findUnique({
    select: {
      libraryId: true,
      id: true,
      name: true,
      originUri: true,
      mimeType: true,
      library: { select: { id: true, name: true, embeddingModelName: true, fileConverterOptions: true } },
    },
    where: { id: fileId },
  })
  if (!file) {
    throw new Error(`File not found in database: ${fileId}`)
  }
  try {
    if (!file.library.embeddingModelName) {
      throw new Error(`Embedding model not found for library: ${file.libraryId}`)
    }

    addToQueue(file.libraryId, [file.id])

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
    if (fs.existsSync(uploadFilePath)) {
      // re-generate markdown
      await convertUploadToMarkdown(file.id, {
        removeUploadFile: false,
        fileConverterOptions: file.library.fileConverterOptions || '',
      })
    }
    if (!fs.existsSync(markdownFilePath)) {
      throw new Error(`Markdown file does not exist: ${markdownFilePath}`)
    }
    const embeddedFile = await embedFile(file.libraryId, file.library.embeddingModelName, {
      id: file.id,
      name: file.name,
      originUri: file.originUri!,
      mimeType: file.mimeType, // Use markdown mimetype for re-processing
      path: markdownFilePath,
    })

    const updatedFile = await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        ...embeddedFile,
        processedAt: new Date(),
        processingEndedAt: new Date(),
        processingErrorAt: null,
        processingErrorMessage: null,
      },
    })
    removeIdFromQueue(file.libraryId, [file.id])
    return updatedFile
  } catch (error) {
    const failedFile = await prisma.aiLibraryFile.update({
      where: { id: file.id },
      data: {
        processingErrorAt: new Date(),
        processingErrorMessage: (error as Error).message,
      },
    })
    removeIdFromQueue(file.libraryId, [file.id])
    return failedFile
  }
}

builder.mutationField('processFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: (_query, _source, { fileId }) => processFile(fileId),
  }),
)

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
        if (!file.library.embeddingModelName) {
          throw new Error(`Embedding model not found for library: ${file.libraryId}`)
        }
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

const processingQueue: Record<string, string[]> = {}
// Adding new files to queue, prevent overlapping parallel runs
const addToQueue = (libraryId: string, fileIds: string[]) => {
  const existing = processingQueue[libraryId] || []
  processingQueue[libraryId] = Array.from(new Set([...existing, ...fileIds]))
}
// remove single Id from queue
const removeIdFromQueue = (libraryId: string, fileIds: string[]) => {
  processingQueue[libraryId] = (processingQueue[libraryId] || []).filter((id) => !fileIds.includes(id))
}
// cleanup processed Ids and Ids which do not exist anymore (example: dropped files while processing)
const cleanUpQueue = async (libraryId: string) => {
  const stillUnprocessedIds = (await getUnprocessedFiles(libraryId)).map((file) => file.id)
  processingQueue[libraryId] = (processingQueue[libraryId] || []).filter((id) => stillUnprocessedIds.includes(id))
}

const checkNewFilesToProcess = async (libraryId: string) => {
  const previousFileIds = processingQueue[libraryId] ?? []
  const currentUnprocessedFiles = await getUnprocessedFiles(libraryId)
  const newFiles = currentUnprocessedFiles.filter((file) => !previousFileIds.includes(file.id))
  return newFiles
}
const getUnprocessedFiles = async (libraryId: string) => {
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

const countUnprocessedFiles = async (libraryId: string) => {
  return prisma.aiLibraryFile.count({
    where: {
      libraryId,
      processedAt: null,
    },
  })
}

builder.queryField('unprocessedFilesCount', (t) =>
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
