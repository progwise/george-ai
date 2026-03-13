import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME, getRegistryFilter, parseRegistryKey } from './common'
import { logger } from './common'
import { InferenceHostConfig, RegistryEntrySchema, WorkspaceConfig } from './schema'

export type RegistryHandlerParams =
  | { workspaceId: string; entryType: 'workspace'; hostId: undefined; operation: 'update'; entry: WorkspaceConfig }
  | { workspaceId: string; entryType: 'workspace'; hostId: undefined; operation: 'delete'; entry: null }
  | {
      workspaceId: string
      entryType: 'inference-host'
      hostId: string
      operation: 'update'
      entry: InferenceHostConfig
    }
  | { workspaceId: string; entryType: 'inference-host'; hostId: string; operation: 'delete'; entry: null }

export async function watchRegistry(
  handler: (params: RegistryHandlerParams) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watchBucket({
    schema: RegistryEntrySchema,
    bucketName: REGISTRY_BUCKET_NAME,
    filter: getRegistryFilter({}),
    handler: async ({ key, operation, entry }) => {
      const parsedKey = parseRegistryKey(key)

      if (operation === 'delete') {
        if (parsedKey.type === 'workspace') {
          return await handler({
            entryType: 'workspace',
            workspaceId: parsedKey.workspaceId,
            hostId: undefined,
            operation: 'delete',
            entry: null,
          })
        } else if (parsedKey.type === 'inference-host') {
          return await handler({
            entryType: 'inference-host',
            workspaceId: parsedKey.workspaceId,
            hostId: parsedKey.hostId,
            operation: 'delete',
            entry: null,
          })
        } else {
          logger.warn('Received delete operation for unknown registry entry type - skipping', {
            key,
            operation,
            parsedKey,
          })
          return
        }
      }
      if (operation === 'update' && entry) {
        if (entry.type === 'workspace') {
          return await handler({
            entryType: 'workspace',
            workspaceId: parsedKey.workspaceId,
            hostId: undefined,
            operation: 'update',
            entry,
          })
        } else if (entry.type === 'inference-host' && parsedKey.hostId) {
          return await handler({
            entryType: 'inference-host',
            workspaceId: parsedKey.workspaceId,
            hostId: parsedKey.hostId,
            operation: 'update',
            entry,
          })
        } else {
          logger.warn('Received update operation for unknown registry entry type - skipping', {
            key,
            operation,
            entry,
            parsedKey,
          })
          return
        }
      }
    },
  })
}
