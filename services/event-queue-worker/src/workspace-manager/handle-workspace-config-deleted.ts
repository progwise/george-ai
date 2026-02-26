import { deleteProviderInstance, getProviderInstances } from '@george-ai/event-service-client'

import { logger } from '../common'

export async function handleWorkspaceConfigDeleted(workspaceId: string) {
  logger.debug('Handle Workspace Config Deleted', { workspaceId })
  const providerInstances = await getProviderInstances({ workspaceId })
  await Promise.all(
    providerInstances.map(async (entry) => {
      await deleteProviderInstance({
        workspaceId,
        modelProvider: entry.modelProvider,
        providerInstanceId: entry.providerInstanceId,
      })
      logger.debug('Deleted provider instance due to workspace config deletion', {
        workspaceId,
        modelProvider: entry.modelProvider,
        providerInstanceId: entry.providerInstanceId,
      })
    }),
  )
}
