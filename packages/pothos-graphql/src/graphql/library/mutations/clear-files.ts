import { canWriteWorkspaceOrThrow, library } from '@george-ai/app-domain'
import { getWorkspace } from '@george-ai/file-management'

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
      const workspace = await getWorkspace(workspaceId)
      if (!workspace) {
        throw new Error('Workspace Manifest not found for workspaceId: ' + workspaceId)
      }
      return await library.clearDocuments(workspace, { libraryId })
    },
  }),
)
