import { eventClient } from '../client'
import { logger } from '../common'
import { REGISTRY_BUCKET_NAME, RegistryEntryType, getRegistryFilter } from './common'
import { InferenceHostConfig, RegistryEntry, RegistryEntrySchema, WorkspaceConfig } from './schema'

export async function getRegistryEntries(args: { type: 'workspace'; workspaceId?: string }): Promise<WorkspaceConfig[]>
export async function getRegistryEntries(args: {
  type: 'inference-host'
  workspaceId?: string
}): Promise<InferenceHostConfig[]>
export async function getRegistryEntries(args: {
  type: RegistryEntryType
  workspaceId?: string
}): Promise<RegistryEntry[]> {
  const { type, workspaceId } = args

  const filter = getRegistryFilter({ type, workspaceId })

  const keys = await eventClient.getBucketKeys({ bucketName: REGISTRY_BUCKET_NAME, filter })

  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await eventClient.getBucketEntry({
          schema: RegistryEntrySchema,
          bucketName: REGISTRY_BUCKET_NAME,
          key,
        })
        if (!data || !data.value) {
          logger.warn('cannot decode registry entry', key)
          return null
        }

        return data.value
      } catch (error) {
        logger.error('error reading entry from registry', { key, error })
      }
    }),
  )

  return entries.filter((entry) => !!entry)
}
