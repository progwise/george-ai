import {
  WorkspaceConfig,
  deleteProviderInstance,
  getProviderInstances,
  writeProviderInstance,
} from '@george-ai/event-service-client'

import { logger } from './common'

export async function handleWorkspaceConfigUpdated(workspaceId: string, config: WorkspaceConfig) {
  logger.debug('handle Workspace Config Updated', { workspaceId, config })

  const providerHealthEntries = await getProviderInstances({
    workspaceId,
  })

  logger.debug('Current provider health entries for workspace', { workspaceId, providerHealthEntries })

  const providersToDelete = providerHealthEntries.filter(
    (entry) => !config.providerInstances.some((provider) => provider.providerInstanceId === entry.providerInstanceId),
  )

  logger.debug('Provider health entries to delete based on updated config', { workspaceId, providersToDelete })

  await Promise.all(
    providersToDelete.map(async (entry) => {
      await deleteProviderInstance({
        workspaceId,
        modelProvider: entry.modelProvider,
        providerInstanceId: entry.providerInstanceId,
      })
      logger.debug('Deleted provider instance due to workspace config update', {
        workspaceId,
        modelProvider: entry.modelProvider,
        providerInstanceId: entry.providerInstanceId,
      })
    }),
  )

  // Writing configured provider instances to the bucket will trigger health checks and updates for those instances,
  // so we don't need to manually write healthy entries here.
  // The workspace manager's responsibility is to ensure that any provider instances that are no longer in the config are deleted,
  // and any provider instances that are still in the config will be picked up by the health check process as long as they are running and healthy.

  await Promise.all(
    config.providerInstances.map(async (providerInstance) => {
      await writeProviderInstance({
        workspaceId,
        version: 1,
        providerInstanceId: providerInstance.providerInstanceId,
        modelProvider: providerInstance.modelProvider,
        name: providerInstance.name,
        connection: {
          encryptedApiKey: providerInstance.connection.encryptedApiKey,
          baseUrl: providerInstance.connection.baseUrl,
        },
        status: undefined, // TODO: if there was a status already: preserve.
        timestamp: new Date(),
      })
      logger.debug('Ensured provider instance from updated workspace config', {
        workspaceId,
        modelProvider: providerInstance.modelProvider,
        providerInstanceId: providerInstance.providerInstanceId,
      })
      // We can optionally implement logic here to check the health of the provider instance and log if it's not healthy,
      // but we should avoid writing unhealthy entries to the bucket as that could cause confusion.
    }),
  )
}
