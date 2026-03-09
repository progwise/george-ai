import {
  InferenceHostConfig,
  WorkspaceConfig,
  deleteRegistryEntry,
  getRegistryEntries,
  writeRegistryEntry,
} from '@george-ai/event-service-client'

import { logger } from './common'

export async function handleWorkspaceConfigUpdated(workspaceId: string, config: WorkspaceConfig) {
  logger.debug('handle Workspace Config Updated', { workspaceId, config })

  const existingHostEntries = await getRegistryEntries({ type: 'inference-host', workspaceId })

  logger.debug('Current model hosts for workspace', { workspaceId, existingHostEntries })

  const hostsToDelete = existingHostEntries.filter(
    (entry) => !config.modelHosts.some((host) => host.hostId === entry.hostId),
  )

  logger.debug('Provider health entries to delete based on updated config', { workspaceId, hostsToDelete })

  await Promise.all(
    hostsToDelete.map(async (entry) => {
      await deleteRegistryEntry({
        type: 'inference-host',
        workspaceId,
        hostId: entry.hostId,
      })
      logger.warn('Deleted host instance in registry due to workspace config update', {
        workspaceId,
        hostId: entry.hostId,
        driver: entry.connection.driver,
        name: entry.name,
      })
    }),
  )

  await Promise.all(
    config.modelHosts.map(async (host) => {
      const entry: InferenceHostConfig = {
        type: 'inference-host',
        workspaceId,
        version: 1,
        name: host.name,
        connection: host.connection,
        hostId: host.hostId,
        lastUpdate: new Date(),
      }
      await writeRegistryEntry(entry)
      logger.debug('Ensured provider instance from updated workspace config', {
        workspaceId,
        host,
        entry,
      })
    }),
  )
}
