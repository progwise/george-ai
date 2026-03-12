import { canAdminWorkspaceOrThrow, migrateLibrary } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('migrateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'LibraryManifest',
    args: {
      workspaceId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId, libraryId }, { session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      const result = await migrateLibrary({ workspaceId, libraryId })
      return result
    },
  }),
)
