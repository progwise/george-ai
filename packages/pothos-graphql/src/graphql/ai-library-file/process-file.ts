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

    if (!file.library.fileConverterOptions) {
      throw new Error(`File processing options not found for library: ${file.libraryId}`)
    }

    await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingStartedAt: new Date(),
      },
    })

    const markdownFilePath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId })
    const uploadFilePath = getUploadFilePath({ fileId: file.id, libraryId: file.libraryId })
    if (fs.existsSync(uploadFilePath)) {
      // re-generate markdown
      await convertUploadToMarkdown(file.id, {
        removeUploadFile: false,
        fileConverterOptions: file.library.fileConverterOptions,
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
