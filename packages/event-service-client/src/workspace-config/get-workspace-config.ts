import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME, getKey } from './common'
import { logger } from './common'
import { type WorkspaceConfig, WorkspaceConfigSchema } from './schema'

export { type WorkspaceConfig }

export async function getWorkspaceConfig(workspaceId: string): Promise<WorkspaceConfig | null> {
  const data = await eventClient.getBucketEntry({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(workspaceId),
  })
  if (!data || data.length === 0) {
    return null
  }
  const decodedData = new TextDecoder().decode(data)
  logger.debug(`Read workspace config`, JSON.stringify(JSON.parse(decodedData).providerInstances, null, 2))
  return WorkspaceConfigSchema.parse(JSON.parse(decodedData))
}
