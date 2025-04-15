import { embedFile } from '@george-ai/langchain-chat'

import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'

export const processFile = async (fileId: string) => {
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  if (!file) {
    throw new Error(`File not found: ${fileId}`)
  }

  await prisma.aiLibraryFile.update({
    where: { id: fileId },
    data: {
      processingStartedAt: new Date(),
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
    await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingErrorAt: new Date(),
        processingErrorMessage: (error as Error).message,
      },
    })
    throw error
  }
}
