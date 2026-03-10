import { prisma } from '@george-ai/app-database'
import { deleteRegistryEntry, getRegistryEntry, writeRegistryEntry } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function removeInferenceHost(params: { workspaceId: string; hostId: string }): Promise<void> {
  logger.debug('Removing inference host with params:', params)

  const { workspaceId, hostId } = params

  const entry = await getRegistryEntry({
    type: 'inference-host',
    workspaceId,
    hostId,
  })
  try {
    await deleteRegistryEntry({
      type: 'inference-host',
      workspaceId,
      hostId,
    })

    try {
      await prisma.aiServiceProvider.delete({
        where: { id: hostId, workspaceId },
      })
    } catch (error) {
      logger.error('Error deleting inference host from database:', { error, workspaceId, hostId })
      if (entry) {
        await writeRegistryEntry(entry) // Attempt to restore registry entry if DB deletion fails
      }
      throw error
    }
  } catch (error) {
    logger.error('Error removing inference host:', { error, workspaceId, hostId, entry })
    throw error
  }
}
