import { createLogger } from '@george-ai/web-utils'

import { eventClient } from '../client'
import { WORKSPACE_CONFIG_BUCKET_NAME, getKey } from './common'
import { type WorkspaceConfig, WorkspaceConfigSchema } from './schema'

const logger = createLogger('event-service-client:workspace-config')

export { type WorkspaceConfig }

export async function initializeWorkspaceConfigBucket() {
  await eventClient.ensureBucket({
    name: WORKSPACE_CONFIG_BUCKET_NAME,
    options: {
      history: 1,
      ttlMs: undefined,
    },
  })
  return WORKSPACE_CONFIG_BUCKET_NAME
}

async function getWorkspaceConfig(workspaceId: string): Promise<WorkspaceConfig | null> {
  const data = await eventClient.get({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(workspaceId),
  })
  if (!data || data.length === 0) {
    return null
  }
  const decodedData = new TextDecoder().decode(data)
  logger.debug(`Read workspace config`, JSON.stringify(JSON.parse(decodedData).providerInstances, null, 2))
  return WorkspaceConfigSchema.parse(JSON.parse(decodedData))
}

async function writeWorkspaceConfig(entry: WorkspaceConfig): Promise<void> {
  const valueBytes = new TextEncoder().encode(JSON.stringify(entry))
  await eventClient.put({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(entry.workspaceId),
    value: valueBytes,
  })
}

async function deleteWorkspaceConfig(workspaceId: string): Promise<void> {
  await eventClient.delete({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: getKey(workspaceId),
  })
}

async function watchWorkspaceConfigs(
  handler: (params: {
    key: string
    operation: 'create' | 'update' | 'delete'
    value: WorkspaceConfig | null
  }) => Promise<void>,
): Promise<() => Promise<void>> {
  return await eventClient.watch({
    bucketName: WORKSPACE_CONFIG_BUCKET_NAME,
    key: `workspace.*.config`,
    handler: async (entry) => {
      switch (entry.operation) {
        case 'create':
        case 'update': {
          const workspaceEntry = entry.value
            ? WorkspaceConfigSchema.parse(JSON.parse(new TextDecoder().decode(entry.value)))
            : null
          return await handler({ key: entry.key, operation: entry.operation, value: workspaceEntry })
        }
        case 'delete':
          await handler({ key: entry.key, operation: 'delete', value: null })
          return
      }
    },
  })
}

export default {
  deleteWorkspaceConfig,
  getWorkspaceConfig,
  writeWorkspaceConfig,
  watchWorkspaceConfigs,
  WorkspaceConfigSchema,
}
