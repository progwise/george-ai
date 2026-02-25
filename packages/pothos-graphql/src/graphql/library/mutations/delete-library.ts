import { canWriteWorkspaceOrThrow, deleteLibrary } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('deleteLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    nullable: false,
    resolve: async (_source, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      await deleteLibrary(workspaceId, { libraryId })

      return true
    },
  }),
)
