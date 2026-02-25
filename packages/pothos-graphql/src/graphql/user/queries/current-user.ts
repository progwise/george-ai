import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.queryField('currentUser', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    nullable: false,
    resolve: async (query, _source, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      return prisma.user.findFirstOrThrow({
        ...query,
        where: { id: session.user.id },
      })
    },
  }),
)
