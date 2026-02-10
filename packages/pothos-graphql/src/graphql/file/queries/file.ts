import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.queryField('file', (t) => {
  return t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { libraryId, fileId }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const file = await prisma.aiLibraryFile.findFirstOrThrow({
        ...query,
        where: { id: fileId, libraryId, library: { workspaceId } },
      })
      return file
    },
  })
})
