import { prisma } from '../../prisma'

export interface WorkspaceMembershipInfo {
  workspaceId: string
  role: string
}

/**
 * Get user's workspace membership information
 * Uses efficient unique index lookup on WorkspaceMember table
 *
 * @param userId - The user's ID
 * @param requestedWorkspaceId - Optional workspace ID from request header
 * @param fallbackWorkspaceId - User's default workspace ID
 * @returns Workspace membership info or undefined if not a member
 */
export async function getWorkspaceMembership(userId: string, requestedWorkspaceId?: string | null) {
  if (!requestedWorkspaceId) {
    const defaultWorkspace = await prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: {
        defaultWorkspace: {
          select: { id: true, members: { where: { userId }, select: { role: true } } },
        },
      },
    })

    return {
      workspaceId: defaultWorkspace.defaultWorkspace.id,
      role: defaultWorkspace.defaultWorkspace.members[0]?.role ?? 'member',
    }
  }
  // Try requested workspace first
  if (requestedWorkspaceId) {
    const membership = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: requestedWorkspaceId,
          userId,
        },
      },
    })

    if (membership) {
      return {
        workspaceId: requestedWorkspaceId,
        role: membership.role,
      }
    }
  }
  return
}
