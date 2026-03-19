import { GraphQLError } from 'graphql/error'

import { canWriteWorkspaceOrThrow, deleteLibrary } from '@george-ai/app-domain'
import { getWorkspace } from '@george-ai/file-management'

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

      const workspace = await getWorkspace(workspaceId)
      if (!workspace) {
        throw new GraphQLError('Workspace Manifest not found for workspaceId: ' + workspaceId)
      }
      await deleteLibrary(workspace, { libraryId })

      return true
    },
  }),
)
