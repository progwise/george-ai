import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { updateLibrary } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('updateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      data: t.arg({ type: 'LibraryInput', required: true }),
    },
    resolve: async (query, _source, { libraryId, data }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      // Validate fileConverterOptions if provided
      const { aiLibrary, manifest } = await updateLibrary({ workspaceId, libraryId, data })

      logger.info('Library updated', { aiLibrary, manifest })

      return prisma.aiLibrary.findUniqueOrThrow({
        where: { id: libraryId, workspaceId },
        ...query,
      })
    },
  }),
)
