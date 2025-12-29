import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-domain'

/**
 * Verify that a user is an owner of a workspace
 * Throws GraphQLError if not an owner
 *
 * @param workspaceId - The workspace ID
 * @param userId - The user's ID
 * @returns The membership record
 */
export async function requireWorkspaceOwner(workspaceId: string, userId: string) {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  })

  if (!membership || membership.role !== 'owner') {
    throw new GraphQLError('Only workspace owners can perform this action')
  }

  return membership
}
