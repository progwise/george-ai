import fs from 'fs'

import { getFileDir, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { prisma } from '../../prisma'
import { canAccessLibraryOrThrow } from '../library'
import { convertUploadToMarkdown } from './convert-file'

export const processFile = async (fileId: string, userId: string) => {
  const file = await prisma.aiLibraryFile.findUniqueOrThrow({
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

  // TODO: temporary solution to allow crawler to run without a user
  if (userId !== 'crawler') {
    await canAccessLibraryOrThrow(file.libraryId, userId)
  }

  try {
    if (!file.library.embeddingModelName) {
      throw new Error(`Embedding model not found for library: ${file.libraryId}`)
    }

    await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingStartedAt: new Date(),
      },
    })

    const uploadFilePath = getUploadFilePath({ fileId: file.id, libraryId: file.libraryId })
    if (!fs.existsSync(uploadFilePath)) {
      throw new Error(`Processing not possible because Upload file not found: ${uploadFilePath}`)
    }

    // re-generate markdown
    const conversionResult = await convertUploadToMarkdown(file.id, {
      fileConverterOptions: file.library.fileConverterOptions || '',
    })

    const fileDir = getFileDir({ fileId: file.id, libraryId: file.libraryId, errorIfNotExists: true })
    const markdownFilePath = `${fileDir}/${conversionResult.fileName}`

    const embeddedFile = await embedFile(file.libraryId, file.library.embeddingModelName, {
      id: file.id,
      name: file.name,
      originUri: file.originUri!,
      mimeType: file.mimeType, // Use markdown mimetype for re-processing
      markdownFilePath,
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
