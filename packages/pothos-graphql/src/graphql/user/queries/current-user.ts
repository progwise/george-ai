import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.queryField('currentUser', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'CurrentUser',
    nullable: false,
    resolve: async (_source, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const userEntity = await prisma.user.findFirstOrThrow({
        where: { id: session.user.id },
        include: {
          workspaceMemberships: {
            where: { workspaceId },
            select: { workspaceId: true },
          },
        },
      })

      const currentWorkspace =
        userEntity.workspaceMemberships.length > 0
          ? userEntity.workspaceMemberships[0].workspaceId
          : userEntity.defaultWorkspaceId

      return {
        userId: userEntity.id,
        name: userEntity.name ?? userEntity.username,
        username: userEntity.username,
        email: userEntity.email,
        avatarUrl: userEntity.avatarUrl,
        isAdmin: userEntity.isAdmin,
        selectedWorkspaceId: currentWorkspace,
        defaultWorkspaceId: userEntity.defaultWorkspaceId,
        lastLogin: userEntity.lastLogin,
      }
    },
  }),
)
