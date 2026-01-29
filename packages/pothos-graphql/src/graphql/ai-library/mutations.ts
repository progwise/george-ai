import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-domain'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store-client'

import { builder } from '../builder'
import { canWriteWorkspaceOrThrow } from '../workspace'

console.log('Setting up: AiLibrary Mutations')

const AiLibraryInput = builder.inputType('AiLibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    embeddingModelId: t.string({ required: false }),
    ocrModelId: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
    embeddingTimeoutMs: t.int({ required: false }),
    autoProcessCrawledFiles: t.boolean({ required: false }),
  }),
})

builder.mutationField('updateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)

      // Validate fileConverterOptions if provided
      const { embeddingModelId, ocrModelId, ...restData } = data

      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data: {
          name: restData.name,
          description: restData.description,
          url: restData.url,
          fileConverterOptions: data.fileConverterOptions,
          embeddingTimeoutMs: restData.embeddingTimeoutMs,
          autoProcessCrawledFiles: data.autoProcessCrawledFiles ?? undefined,
          // Convert empty strings to null for foreign key fields
          embeddingModelId: embeddingModelId || null,
          ocrModelId: ocrModelId || null,
        },
      })
    },
  }),
)

builder.mutationField('createLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { data }, { workspaceId, session }) => {
      const userId = session.user.id
      const { embeddingModelId, ocrModelId, ...restData } = data

      canWriteWorkspaceOrThrow(workspaceId, userId)

      try {
        const library = await prisma.aiLibrary.create({
          ...query,
          data: {
            name: restData.name,
            description: restData.description,
            url: restData.url,
            fileConverterOptions: data.fileConverterOptions,
            embeddingTimeoutMs: restData.embeddingTimeoutMs,
            autoProcessCrawledFiles: data.autoProcessCrawledFiles ?? undefined,
            ownerId: userId,
            workspaceId,
            // Convert empty strings to null for foreign key fields
            embeddingModelId: embeddingModelId || null,
            ocrModelId: ocrModelId || null,
          },
        })
        await workspaceStorage.createLibrary(workspaceId, { libraryId: library.id, name: library.name })
        return library
      } catch (error) {
        console.error('Error creating library', { workspaceId, userId, error })
        throw new GraphQLError('Failed to create library', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('deleteLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    nullable: false,
    resolve: async (query, _source, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        const result = await prisma.$transaction(
          [
            prisma.aiLibraryFile.deleteMany({ where: { libraryId } }),
            prisma.aiLibraryCrawler.deleteMany({ where: { libraryId } }),
            prisma.aiLibrary.delete({
              ...query,
              where: { id: libraryId },
            }),
          ],
          {},
        )
        await Promise.all([
          workspaceStorage.deleteLibrary(workspaceId, { libraryId }),
          vectorStore.removeChunks({ workspaceId, libraryId }),
        ])

        return result[2]
      } catch (error) {
        console.error('Error deleting library', { workspaceId, libraryId, error })
        throw new GraphQLError('Failed to delete library', { originalError: error as Error })
      }
    },
  }),
)

builder.mutationField('clearFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      try {
        await prisma.aiLibraryFile.deleteMany({
          where: { libraryId },
        })

        await Promise.all([
          workspaceStorage.deleteFiles(workspaceId, { libraryId }),
          vectorStore.removeChunks({ workspaceId: workspaceId, libraryId }),
        ])

        return true
      } catch (error) {
        console.error('Error clearing files from library', { workspaceId, libraryId, error })
        throw new GraphQLError('Failed to clear files from library', { originalError: error as Error })
      }
    },
  }),
)
