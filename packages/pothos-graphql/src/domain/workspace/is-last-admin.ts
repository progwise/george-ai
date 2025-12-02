import { prisma } from '../../prisma'

/**
 * Check if a user is the last admin of a workspace
 *
 * @param workspaceId - The workspace ID
 * @param userId - The user's ID
 * @returns True if the user is the only admin
 */
export async function isLastAdmin(workspaceId: string, userId: string): Promise<boolean> {
  const adminCount = await prisma.workspaceMember.count({
    where: {
      workspaceId,
      role: 'ADMIN',
    },
  })

  if (adminCount === 1) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
    })
    return member?.role === 'ADMIN'
  }

  return false
}
