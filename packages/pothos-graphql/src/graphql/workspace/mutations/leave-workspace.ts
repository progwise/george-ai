import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

// Leave a workspace (any member)
builder.mutationField('leaveWorkspace', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      workspaceId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      const userId = session.user.id

      // Check if user is a member
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      })

      if (!membership) {
        throw new GraphQLError('You are not a member of this workspace')
      }

      // Owners cannot leave the workspace - they must transfer ownership or delete it
      if (membership.role === 'owner') {
        throw new GraphQLError('Owners cannot leave the workspace. Transfer ownership or delete the workspace.')
      }

      // Check if this is the user's default workspace
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { defaultWorkspaceId: true },
      })

      if (user?.defaultWorkspaceId === workspaceId) {
        throw new GraphQLError('Cannot leave your default workspace. Set another workspace as default first.')
      }

      // Remove membership
      await prisma.workspaceMember.delete({
        where: {
          workspaceId_userId: { workspaceId, userId },
        },
      })

      return true
    },
  }),
)
