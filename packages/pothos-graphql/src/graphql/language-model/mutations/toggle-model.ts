import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('toggleModel', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLanguageModel',
    args: {
      id: t.arg.id({ required: true }),
      enabled: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _root, { id, enabled }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)

      return await prisma.aiLanguageModel.update({
        ...query,
        where: {
          id,
          workspaceId,
        },
        data: { enabled },
      })
    },
  }),
)
