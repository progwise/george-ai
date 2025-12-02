import { GraphQLError } from 'graphql'

import { prisma } from '../../prisma'

/**
 * Verify that a user is an admin of a workspace
 * Throws GraphQLError if not an admin
 *
 * @param workspaceId - The workspace ID
 * @param userId - The user's ID
 * @returns The membership record
 */
export async function requireWorkspaceAdmin(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  })

  if (!membership || (membership.role !== 'admin' && membership.role !== 'owner')) {
    throw new GraphQLError('Only workspace admins can perform this action')
  }

  return membership
}
