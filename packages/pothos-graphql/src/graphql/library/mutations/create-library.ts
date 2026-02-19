import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { library as lib } from '@george-ai/file-management'

import { builder } from '../../builder'

builder.mutationField('createLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      data: t.arg({ type: 'LibraryInput', required: true }),
    },
    resolve: async (query, _source, { data }, { workspaceId, session }) => {
      const userId = session.user.id
      const { embeddingModelId, ocrModelId, ...restData } = data

      await canWriteWorkspaceOrThrow(workspaceId, userId)

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
        await lib.create(workspaceId, { libraryId: library.id, name: library.name })
        return library
      } catch (error) {
        if (error instanceof Error) {
          throw new GraphQLError(error.message, { originalError: error })
        }
        throw new GraphQLError('Failed to create library')
      }
    },
  }),
)
