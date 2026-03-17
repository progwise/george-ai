import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { deleteFiles } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('deleteFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileIds: t.arg.idList({ required: true }),
    },
    resolve: async (_source, { libraryId, fileIds }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await deleteFiles(workspaceId, { libraryId, documentIds: fileIds })
    },
  }),
)
