import { embedFile } from '@george-ai/langchain-chat'

import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'

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

  try {
    const embeddedFile = await embedFile(file.libraryId, {
      id: file.id,
      name: file.name,
      originUri: file.originUri!,
      mimeType: file.mimeType,
      path: getFilePath(file.id),
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
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingErrorAt: new Date(),
        processingErrorMessage: (error as Error).message,
      },
    })
  }
}

export const processUnprocessedFiles = async (libraryId: string) => {
  const unprocessedFiles = await getUnprocessedFiles(libraryId)

  await Promise.allSettled(
    unprocessedFiles.map(async (file) => {
      try {
        await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            processedAt: null,
            processingStartedAt: new Date(),
            processingErrorAt: null,
            processingErrorMessage: null,
          },
        })

        const embeddedFile = await embedFile(file.libraryId, {
          id: file.id,
          name: file.name,
          originUri: file.originUri!,
          mimeType: file.mimeType,
          path: getFilePath(file.id),
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
      } catch (error) {
        await prisma.aiLibraryFile.update({
          where: { id: file.id },
          data: {
            processingErrorAt: new Date(),
            processingErrorMessage: (error as Error).message,
          },
        })

        console.error(`Failed to process file ${file.id}:`, error)
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
