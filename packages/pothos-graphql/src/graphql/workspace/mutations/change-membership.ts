import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow, doesOwnWorkspaceOrThrow } from '@george-ai/app-domain'

import { isLastAdmin } from '../../../domain/workspace'
import { builder } from '../../builder'

// Update a member's role (admin only, owner role requires current user to be owner)
builder.mutationField('changeWorkspaceMembership', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'WorkspaceMember',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
      userId: t.arg.id({ required: true }),
      role: t.arg({ type: 'WorkspaceRole', required: true }),
    },
    resolve: async (query, _root, { workspaceId, userId: targetUserId, role }, { session }) => {
      const currentUserId = session.user.id

      // Only owners can promote to owner, otherwise admin is sufficient
      if (role === 'owner') {
        await doesOwnWorkspaceOrThrow(workspaceId, currentUserId)
      } else {
        await canAdminWorkspaceOrThrow(workspaceId, currentUserId)
      }

      // Check if target is a member
      const currentMembership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
      })

      if (!currentMembership) {
        throw new GraphQLError('User is not a member of this workspace')
      }

      // Prevent demoting the last admin
      if ((currentMembership.role === 'admin' || currentMembership.role === 'owner') && role === 'member') {
        const isLast = await isLastAdmin(workspaceId, targetUserId)
        if (isLast) {
          throw new GraphQLError('Cannot demote the last admin. Promote another member first.')
        }
      }

      // Update the role
      return prisma.workspaceMember.update({
        ...query,
        where: {
          workspaceId_userId: { workspaceId, userId: targetUserId },
        },
        data: { role },
      })
    },
  }),
)
