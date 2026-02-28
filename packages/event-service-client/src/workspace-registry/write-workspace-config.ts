import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME, getKey, logger } from './common'
import { type WorkspaceConfig, WorkspaceConfigSchema } from './schema'

export { type WorkspaceConfig }

export async function writeWorkspaceConfig(entry: WorkspaceConfig): Promise<void> {
  const parsedConfig = WorkspaceConfigSchema.parse(entry)
  const stringifiedConfig = JSON.stringify(parsedConfig, null, 2)
  const valueBytes = new TextEncoder().encode(stringifiedConfig)
  logger.debug(`Writing workspace config`, { entry, valueBytesLength: valueBytes.length })
  await eventClient.putBucketEntry({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(entry.workspaceId),
    value: valueBytes,
  })
}
