import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getDocumentFiles } from '@george-ai/file-management'

import { builder } from '../../builder'

builder.queryField('documentFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['DocumentFile'],
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      documentId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { libraryId, documentId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const documentFiles = await getDocumentFiles({ workspaceId, libraryId, documentId })
      return documentFiles
    },
  }),
)
