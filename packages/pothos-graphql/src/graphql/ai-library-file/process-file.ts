import fs from 'node:fs'

import { getMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { convertUploadToMarkdown } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { addToQueue, removeIdFromQueue } from './processing-queue'

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
  addToQueue(file.libraryId, [file.id])
  try {
    if (!file.library.embeddingModelName) {
      throw new Error(`Embedding model not found for library: ${file.libraryId}`)
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
