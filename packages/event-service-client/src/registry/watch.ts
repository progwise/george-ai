import z from 'zod'

import { eventClient } from '../client'
import { REGISTRY_BUCKET_NAME, getRegistryFilter, parseRegistryKey } from './common'
import { logger } from './common'
import { RegistryEntry, RegistryEntrySchema } from './schema'

export async function watchRegistry<T extends RegistryEntry['type']>(
  entryType: T,
  handler: (params: {
    workspaceId: string
    hostId: T extends 'inference-host' ? string : string | undefined
    operation: 'update' | 'delete'
    entry: Extract<RegistryEntry, { type: T }> | null
  }) => Promise<void>,
): Promise<() => Promise<void>> {
  const narrowedSchema = RegistryEntrySchema.options.find(
    (option) => option.shape.type._def.value === entryType,
  ) as unknown as z.ZodType<Extract<RegistryEntry, { type: T }>>

  if (!narrowedSchema) throw new Error(`Invalid entry type: ${entryType}`)

  return await eventClient.watchBucket({
    schema: narrowedSchema,
    bucketName: REGISTRY_BUCKET_NAME,
    filter: getRegistryFilter({ type: entryType }),
    handler: async ({ key, operation, entry }) => {
      const parsedKey = parseRegistryKey(key)

      if (operation !== 'delete' && entry === null) {
        logger.warn('Received non-delete operation without registry entry - skipping', {
          key,
          operation,
          entryType,
          parsedKey,
        })
        return
      }

      if (parsedKey.type !== entryType) {
        logger.warn('Recived registry entry key with different type - skipping', {
          key,
          operation,
          entry,
          entryType,
          parsedKey,
        })
        return
      }

      if (entry && entry.type !== entryType) {
        logger.warn('Recived registry entry with different type - skipping', {
          key,
          operation,
          entry,
          entryType,
          parsedKey,
        })
        return
      }

      return await handler({
        workspaceId: parsedKey.workspaceId,
        hostId: parsedKey.hostId as T extends 'inference-host' ? string : string | undefined,
        operation,
        entry,
      })
    },
  })
}
