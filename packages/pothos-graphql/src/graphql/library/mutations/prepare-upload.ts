import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

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
    resolve: async (query, _source, { data }, context) => {
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)
      return await prisma.aiLibraryFile.create({
        ...query,
        data,
      })
    },
  }),
)
