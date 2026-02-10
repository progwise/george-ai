import { canWriteWorkspaceOrThrow, workspace } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('cancelUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId, fileId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      await workspace.deleteFiles(workspaceId, { libraryId, fileIds: [fileId] })
      return true
    },
  }),
)
