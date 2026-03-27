import { ensureWorkspaceConsumers } from '../action/consumer'
import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME, getRegistryKey, logger } from './common'
import { RegistryEntry } from './schema'

export async function writeRegistryEntry(entry: RegistryEntry): Promise<void> {
  logger.debug(`Writing registry entry`, { entry })
  await ensureWorkspaceConsumers(entry.workspaceId)
  await eventClient.putBucketEntry({
    bucketName: REGISTRY_BUCKET_NAME,
    key: getRegistryKey(entry),
    item: entry,
  })
}
