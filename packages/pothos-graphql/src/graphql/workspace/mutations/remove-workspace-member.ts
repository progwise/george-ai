import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Remove a member from workspace (admin only, cannot remove self)
builder.mutationField('removeWorkspaceMember', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, { workspaceId, userId: targetUserId }, ctx) => {
      const currentUserId = ctx.session.user.id

      // Cannot remove yourself (use leaveWorkspace instead)
      if (currentUserId === targetUserId) {
        throw new GraphQLError('Cannot remove yourself. Use "Leave Workspace" instead.')
      }

      // Check if current user is admin
      await canAdminWorkspaceOrThrow(workspaceId, currentUserId)

      // Check if target is a member
      const targetMembership = await prisma.workspaceMember.findUnique({
        ...query,
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      if (!targetMembership) {
        throw new GraphQLError('User is not a member of this workspace')
      }

      // Remove the member
      await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      return targetMembership
    },
  }),
)
