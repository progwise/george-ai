import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('updateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: 'LibraryInput', required: true }),
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
