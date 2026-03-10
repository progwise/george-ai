import { deleteRegistryEntry, getRegistryEntries } from '@george-ai/event-service-client'

import { logger } from './common'

export async function handleWorkspaceRemoval(workspaceId: string) {
  logger.debug('Handle Workspace Config Deleted', { workspaceId })

  await deleteRegistryEntry({ type: 'workspace', workspaceId })
  const hosts = await getRegistryEntries({ type: 'inference-host', workspaceId })

  await Promise.all(
    hosts.map(async (entry) => {
      await deleteRegistryEntry({ type: 'inference-host', workspaceId, hostId: entry.hostId })
      logger.debug('Deleted provider instance due to workspace config deletion', {
        workspaceId,
        entry,
      })
    }),
  )
}
