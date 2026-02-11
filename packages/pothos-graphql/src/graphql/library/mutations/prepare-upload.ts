import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('prepareUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    args: {
      data: t.arg({
        type: builder.inputType('PrepareUploadInput', {
          fields: (t) => ({
            name: t.string({ required: true }),
            originUri: t.string({ required: true }),
            mimeType: t.string({ required: true }),
            libraryId: t.string({ required: true }),
            size: t.int({ required: true }),
            originModificationDate: t.field({ type: 'DateTime', required: true }),
          }),
        }),
        required: true,
      }),
    },
    nullable: false,
    resolve: async (query, _source, { data }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      try {
        return await prisma.aiLibraryFile.upsert({
          ...query,
          where: { libraryId_originUri: { libraryId: data.libraryId, originUri: data.originUri } },
          create: {
            name: data.name,
            originUri: data.originUri,
            mimeType: data.mimeType,
            size: data.size,
            originModificationDate: data.originModificationDate,
            libraryId: data.libraryId,
          },
          update: {
            name: data.name,
            mimeType: data.mimeType,
            size: data.size,
            originModificationDate: data.originModificationDate,
          },
        })
      } catch (error) {
        logger.error('Error preparing file upload', { error, data, userId: session.user.id, workspaceId })
        throw new GraphQLError(
          'Error preparing file upload: ' + (error instanceof Error ? error.message : 'Unknown error'),
        )
      }
    },
  }),
)
