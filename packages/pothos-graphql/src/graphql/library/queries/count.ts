import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.queryField('countFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      originUriPrefix: t.arg.string({ required: false }),
      namePrefix: t.arg.string({ required: false }),
      showArchived: t.arg.boolean({ required: true }),
    },
    resolve: async (_root, { libraryId, originUriPrefix, namePrefix, showArchived }, context) => {
      const workspaceId = context.workspaceId
      await canReadWorkspaceOrThrow(workspaceId, context.session.user.id)
      const count = await prisma.aiLibraryFile.count({
        where: {
          libraryId,
          originUri: { startsWith: originUriPrefix || undefined },
          name: { startsWith: namePrefix || undefined },
          archivedAt: showArchived ? undefined : null,
        },
      })
      return count
    },
  }),
)
