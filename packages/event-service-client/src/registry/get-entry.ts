import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME, RegistryEntryType, getRegistryKey } from './common'
import { logger } from './common'
import { InferenceHostConfig, RegistryEntry, RegistryEntrySchema, WorkspaceConfig } from './schema'

export async function getRegistryEntry(args: {
  type: 'workspace'
  workspaceId: string
}): Promise<WorkspaceConfig | null>
export async function getRegistryEntry(args: {
  type: 'inference-host'
  workspaceId: string
  hostId: string
}): Promise<InferenceHostConfig | null>
export async function getRegistryEntry(args: {
  type: RegistryEntryType
  workspaceId: string
  hostId?: string
}): Promise<RegistryEntry | null> {
  const key = getRegistryKey(args)
  const entryData = await eventClient.getBucketEntry({
    schema: RegistryEntrySchema,
    bucketName: REGISTRY_BUCKET_NAME,
    key,
  })
  if (!entryData || !entryData.value) {
    return null
  }
  logger.debug(`Read registry entry`, { key, entryData })
  return entryData.value
}
