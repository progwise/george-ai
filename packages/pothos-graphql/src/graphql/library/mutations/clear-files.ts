import { canWriteWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('clearFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await workspace.deleteFiles(workspaceId, { libraryId })
    },
  }),
)
