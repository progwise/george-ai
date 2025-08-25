import fs from 'node:fs'

import { getFileDir } from '@george-ai/file-management'
import { embedFile } from '@george-ai/langchain-chat'

import { canAccessLibraryOrThrow, processFile } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.mutationField('processFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: (_query, _source, { fileId }, context) => processFile(fileId, context.session.user.id),
  }),
)

builder.mutationField('embedFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      conversionId: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { fileId, conversionId }, context) => {
      const file = await prisma.aiLibraryFile.findUniqueOrThrow({
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

      // TODO: Loads library from db again, optimize
      await canAccessLibraryOrThrow(file.libraryId, context.session.user.id)
      if (!file.library.embeddingModelName) {
        throw new Error(`Library ${file.libraryId} has no configured embedding model`)
      }

      const conversion = await prisma.aiLibraryFileConversion.findFirstOrThrow({
        where: { ...(conversionId ? { id: conversionId } : { success: true }) },
        orderBy: { createdAt: 'desc' },
        select: { fileName: true, id: true },
      })
      // Get the latest successful markdown file path
      const markdownFilePath = getFileDir({ fileId: file.id, libraryId: file.libraryId }) + '/' + conversion.fileName

      if (!fs.existsSync(markdownFilePath)) {
        throw new Error(
          `Converted Markdown file for file id ${file.id} and conversion id ${conversion.id} does not exist on ${markdownFilePath}. Cannot embed.`,
        )
      }

      const embeddedFile = await embedFile(file.libraryId, file.library.embeddingModelName, {
        id: file.id,
        name: file.name,
        originUri: file.originUri!,
        mimeType: file.mimeType, // Use markdown mimetype for re-processing
        markdownFilePath,
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
