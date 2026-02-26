import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME } from './common'
import { logger } from './common'
import { type WorkspaceConfig, WorkspaceConfigSchema } from './schema'

export async function watchWorkspaceConfigs(
  handler: (params: {
    workspaceId: string
    operation: 'update' | 'delete'
    value: WorkspaceConfig | null
  }) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watchBucket({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: `workspace.*.config`,
    handler: async (entry) => {
      const workspaceId = entry.key.split('.')[1]
      switch (entry.operation) {
        case 'update': {
          const rawText = entry.value ? new TextDecoder().decode(entry.value) : null
          if (!rawText || rawText.length < 2) {
            logger.warn('Received empty workspace config entry', { entry })
            throw new Error('Received empty workspace config entry')
          }
          const json = JSON.parse(rawText)
          const data = WorkspaceConfigSchema.parse(json)
          return await handler({ workspaceId, operation: entry.operation, value: data })
        }

        case 'delete':
          await handler({ workspaceId, operation: 'delete', value: null })
          return
      }
    },
  })
}
