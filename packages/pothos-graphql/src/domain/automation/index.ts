/**
 * Automation domain logic.
 */
import type { Prisma } from '@george-ai/app-domain'
import { prisma } from '@george-ai/app-domain'

export * from './constants'
export * from './sync-items'

/**
 * Check if user can access an automation.
 * Access is granted if the user is a member of the workspace that owns the automation.
 */
export const canAccessAutomationOrThrow = async (
  automationId: string,
  userId: string,
  options?: { include: Prisma.AiAutomationInclude },
) => {
  const automation = await prisma.aiAutomation.findUniqueOrThrow({
    include: options?.include || {},
    where: { id: automationId },
  })

  // Check if user is a member of the automation's workspace
  const isMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: automation.workspaceId,
      userId,
    },
  })

  if (!isMember) {
    throw new Error(`You do not have permission to access this automation`)
  }

  return automation
}

/**
 * Get where clause for accessing automations in a workspace.
 */
export const getCanAccessAutomationWhere = (workspaceId: string): Prisma.AiAutomationWhereInput => ({
  workspaceId,
})
