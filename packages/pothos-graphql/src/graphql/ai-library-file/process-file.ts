import fs from 'node:fs'

import { getFileDir, getLatestMarkdownFilePath, getUploadFilePath } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { convertUploadToMarkdown } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const getLatestSuccessfulMarkdownFilePath = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}): Promise<string | null> => {
  try {
    // Get the latest successful conversion attempt from database
    const latestSuccessfulAttempt = await prisma.aiFileConversionAttempt.findFirst({
      where: {
        fileId,
        success: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (latestSuccessfulAttempt) {
      const fileDir = getFileDir({ fileId, libraryId })
      const filePath = `${fileDir}/${latestSuccessfulAttempt.fileName}`
      
      if (fs.existsSync(filePath)) {
        return filePath
      }
    }

    // Fallback to filesystem-based lookup (includes legacy converted.md)
    // Legacy files are considered successful since they worked in previous versions
    return await getLatestMarkdownFilePath({ fileId, libraryId })
  } catch {
    // Fallback to filesystem lookup if database query fails
    return await getLatestMarkdownFilePath({ fileId, libraryId })
  }
}

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

    await prisma.aiLibraryFile.update({
      where: { id: fileId },
      data: {
        processingStartedAt: new Date(),
      },
    })

    const uploadFilePath = getUploadFilePath({ fileId: file.id, libraryId: file.libraryId })
    if (fs.existsSync(uploadFilePath)) {
      // re-generate markdown
      await convertUploadToMarkdown(file.id, {
        removeUploadFile: false,
        fileConverterOptions: file.library.fileConverterOptions || '',
      })
    }
    
    // Get the latest successful markdown file path
    const markdownFilePath = await getLatestSuccessfulMarkdownFilePath({
      fileId: file.id, 
      libraryId: file.libraryId
    })
    
    if (!markdownFilePath) {
      throw new Error(`No successful markdown conversion found for file ${file.id}. Cannot embed failed conversions.`)
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

builder.mutationField('embedFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { fileId }) => {
      const file = await prisma.aiLibraryFile.findUnique({
        select: {
          ...query.select,
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
      if (!file.library.embeddingModelName) {
        throw new Error(`Library ${file.libraryId} has no configured embedding model`)
      }
      // Get the latest successful markdown file path
      const markdownFilePath = await getLatestSuccessfulMarkdownFilePath({
        fileId: file.id, 
        libraryId: file.libraryId
      })
      
      if (!markdownFilePath) {
        throw new Error(`No successful markdown conversion found for file ${file.id}. Cannot embed failed conversions.`)
      }
      
      const embeddedFile = await embedFile(file.libraryId, file.library.embeddingModelName, {
        id: file.id,
        name: file.name,
        originUri: file.originUri!,
        mimeType: file.mimeType, // Use markdown mimetype for re-processing
        path: markdownFilePath,
      })
      console.log(
        `successfully embedded file ${file.name} of library ${file.library.name} with ${embeddedFile.chunks} chunks.`,
      )

      // Update the file record with the chunks count
      const updatedFile = await prisma.aiLibraryFile.update({
        select: query.select,
        where: { id: fileId },
        data: { chunks: embeddedFile.chunks },
      })

      return updatedFile
    },
  }),
)
