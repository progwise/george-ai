import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('deleteFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { libraryId, fileId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const file = await prisma.aiLibraryFile.findFirstOrThrow({
        ...query,
        where: {
          id: fileId,
          libraryId,
        },
      })
      if (!file) {
        throw new GraphQLError('File not found')
      }
      await workspace.deleteFiles(workspaceId, { libraryId, fileIds: [fileId] })
      return file
    },
  }),
)
