import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { SYSTEM_WORKSPACE_ID, logger } from './common'

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  logger.debug('Deleting workspace', { workspaceId })

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.updateMany({
        where: {
          defaultWorkspaceId: workspaceId,
        },
        data: {
          defaultWorkspaceId: SYSTEM_WORKSPACE_ID,
        },
      })

      await tx.workspace.delete({
        where: {
          id: workspaceId,
        },
      })

      await vectorStore.removeWorkspace(workspaceId)

      await workspaceStorage.deleteWorkspace(workspaceId)
    })
  } catch (error) {
    logger.error('Error deleting workspace', { error, workspaceId })
    throw new DomainError('Failed to delete workspace. Please try again later.', 'workspace')
  }
}
