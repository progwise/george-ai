import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME, getKey } from './common'
import { logger } from './common'

export async function deleteWorkspaceConfig(workspaceId: string): Promise<void> {
  logger.debug('Deleting workspace config', { workspaceId })
  await eventClient.deleteBucketEntry({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(workspaceId),
  })
}
