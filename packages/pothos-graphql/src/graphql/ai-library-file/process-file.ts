import { embedFile } from '@george-ai/langchain-chat'

import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { FileStatus } from './file-status'

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
      processingStartedAt: new Date(),
      status: FileStatus.Processing,
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
        status: FileStatus.Completed,
      },
    })
  } catch (error) {
    return await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingErrorAt: new Date(),
        processingErrorMessage: (error as Error).message,
        status: FileStatus.Failed,
      },
    })
  }
}

export const processUnprocessedFiles = async (libraryId: string) => {
  //doesn't select in process files that are at most 2 minutes old
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)

  const unprocessedFiles = await prisma.aiLibraryFile.findMany({
    where: {
      libraryId,
      OR: [
        { status: FileStatus.Pending },
        { status: FileStatus.Failed },
        {
          AND: [{ status: FileStatus.Processing }, { processingStartedAt: { lt: twoMinutesAgo } }],
        },
      ],
    },
  })

  for (const file of unprocessedFiles) {
    try {
      await prisma.aiLibraryFile.update({
        where: { id: file.id },
        data: {
          processingStartedAt: new Date(),
          status: FileStatus.Processing,
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
          status: FileStatus.Completed,
        },
      })
    } catch (error) {
      await prisma.aiLibraryFile.update({
        where: { id: file.id },
        data: {
          processingErrorAt: new Date(),
          processingErrorMessage: (error as Error).message,
          status: FileStatus.Failed,
        },
      })

      console.error(`Failed to process file ${file.id}:`, error)
    }
  }
}
