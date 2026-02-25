import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME, getKey, logger } from './common'
import { type WorkspaceConfig } from './schema'

export { type WorkspaceConfig }

export async function writeWorkspaceConfig(entry: WorkspaceConfig): Promise<void> {
  const valueBytes = new TextEncoder().encode(JSON.stringify(entry))
  logger.debug(`Writing workspace config`, { entry, valueBytesLength: valueBytes.length })
  await eventClient.putBucketEntry({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(entry.workspaceId),
    value: valueBytes,
  })
}
