import { prisma } from '@george-ai/app-database'
import { deleteRegistryEntry } from '@george-ai/event-service-client'
import { workspace as ws } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

import { DomainError } from '../error'
import { SYSTEM_WORKSPACE_ID, logger } from './common'

export async function deleteWorkspace(workspaceId: string): Promise<void> {
  logger.debug('Deleting workspace', { workspaceId })

  if (workspaceId === SYSTEM_WORKSPACE_ID) {
    logger.error('Attempted to delete system workspace', { workspaceId })
    throw new DomainError('Cannot delete system workspace', 'workspace')
  }

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

      const manifest = await ws.get(workspaceId)

      const { modelDriver, modelName } = manifest?.settings?.embedding || {}

      if (modelDriver && modelName) {
        await vectorStore.removeVectorStore({ workspaceId, modelDriver, modelName }).catch((error) => {
          logger.error('Error removing vector store during workspace deletion', { error, workspaceId })
        })
      } else {
        logger.warn('Workspace manifest does not contain embedding settings, skipping vector store deletion', {
          workspaceId,
          manifest,
        })
      }

      await ws.delete(workspaceId)

      await deleteRegistryEntry({ workspaceId, type: 'workspace' })
    })
  } catch (error) {
    logger.error('Error deleting workspace', { error, workspaceId })
    throw new DomainError('Failed to delete workspace. Please try again later.', 'workspace')
  }
}
