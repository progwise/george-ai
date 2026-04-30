import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME, getRegistryFilter, getRegistryKey } from './common'
import { logger } from './common'

type DeleteArgs =
  | { type: 'workspace'; workspaceId: string }
  | { type: 'inference-host'; workspaceId: string; hostId: string }

export async function deleteRegistryEntry(args: DeleteArgs): Promise<void> {
  const { type, workspaceId } = args
  logger.debug('Deleting registry entry', args)
  if (type === 'workspace') {
    return await eventClient.deleteBucketEntries({
      bucketName: REGISTRY_BUCKET_NAME,
      filter: getRegistryFilter({ type, workspaceId }),
    })
  }

  if (type === 'inference-host') {
    const { hostId } = args
    return await eventClient.deleteBucketEntry({
      bucketName: REGISTRY_BUCKET_NAME,
      key: getRegistryKey({ type, workspaceId, hostId }),
    })
  }

  logger.error('Invalid arguments for deleting registry entry', args)
  throw new Error(`Invalid arguments for deleting registry entry: ${JSON.stringify(args)}`)
}
