import { embedFile } from '@george-ai/langchain-chat'

import { getMarkdownFilePath, getUploadFilePAth } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

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
    // Determine the file path to use based on whether this is initial processing or re-processing
    let filePath: string
    if (file.uploadedAt) {
      // File has been uploaded and converted - use the markdown file for re-processing
      filePath = getMarkdownFilePath({ fileId: file.id, libraryId: file.libraryId })
      console.log(`Re-processing file ${file.id} using converted markdown: ${filePath}`)
    } else {
      // Initial processing - use the original uploaded file
      if (!file.name) {
        throw new Error(`File record ${fileId} is missing original name for initial processing.`)
      }
      filePath = getUploadFilePAth({ fileId: file.id, libraryId: file.libraryId })
      console.log(`Initial processing file ${file.id} using original file: ${filePath}`)
    }

    const embeddedFile = await embedFile(file.libraryId, {
      id: file.id,
      name: file.name,
      originUri: file.originUri!,
      mimeType: file.uploadedAt ? 'text/markdown' : file.mimeType, // Use markdown mimetype for re-processing
      path: filePath,
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
