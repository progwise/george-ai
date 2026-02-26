import { logger } from '../common'
import { removeFromCheckMap } from './provider-instances-map'

export async function handleProviderInstanceDeleted(parameters: {
  workspaceId: string
  modelProvider: string
  providerInstanceId: string
}) {
  const { workspaceId, modelProvider, providerInstanceId } = parameters
  logger.info('Handle Provider Instance Deleted: remove planned checks', {
    workspaceId,
    modelProvider,
    providerInstanceId,
  })
  removeFromCheckMap(providerInstanceId)
}
