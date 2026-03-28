import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { deleteFiles } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('deleteDocument', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true }),
    },
    resolve: async (query, _parent, { libraryId, documentId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const file = await prisma.aiLibraryFile.findFirstOrThrow({
        ...query,
        where: {
          id: documentId,
          libraryId,
        },
      })
      await deleteFiles(workspaceId, { libraryId, documentIds: [documentId] })
      return file
    },
  }),
)
