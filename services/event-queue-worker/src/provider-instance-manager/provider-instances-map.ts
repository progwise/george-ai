import { ModelProvider, ProviderConnection, ProviderHealthStatus } from '@george-ai/app-commons'
import { writeProviderInstance } from '@george-ai/event-service-client'
import { statusReport } from '@george-ai/llm-client'

import { logger } from './common'

const PROVIDER_CHECK_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes

interface ProviderInstanceData {
  workspaceId: string
  modelProvider: ModelProvider
  connection: ProviderConnection
  timestamp?: Date
  status?: ProviderHealthStatus | undefined | null
}

const providerInstancesMap = new Map<
  string, // key is only provider instance id to avoid excessive health checks
  { timeout?: NodeJS.Timeout; instance: ProviderInstanceData }
>()

export function planMatureStatusCheck(providerInstanceId: string, newData: ProviderInstanceData) {
  let entry = providerInstancesMap.get(providerInstanceId)

  if (entry) {
    // Mismatches should never happen.
    if (entry.instance.workspaceId !== newData.workspaceId || entry.instance.modelProvider !== newData.modelProvider) {
      logger.error(
        'Received update for provider instance with mismatched workspaceId or modelProvider, skipping update',
        {
          providerInstanceId,
          existingWorkspaceId: entry.instance.workspaceId,
          existingModelProvider: entry.instance.modelProvider,
          incomingWorkspaceId: newData.workspaceId,
          incomingModelProvider: newData.modelProvider,
        },
      )
      return
    }
    // Cancel timeout
    clearTimeout(entry.timeout)
    // Update existing entry for this provider instance id
    entry.timeout = undefined
    entry.instance.connection = newData.connection
    entry.instance.timestamp = newData.timestamp
    entry.instance.status = newData.status
  } else {
    entry = {
      instance: {
        workspaceId: newData.workspaceId,
        modelProvider: newData.modelProvider,
        connection: newData.connection,
        timestamp: newData.timestamp,
        status: newData.status,
      },
    }
    providerInstancesMap.set(providerInstanceId, entry)
  }

  entry.timeout = setTimeout(async () => {
    const entry = providerInstancesMap.get(providerInstanceId)
    if (!entry) {
      logger.warn('No entry found in providerInstancesMap for providerInstanceId during timeout check', {
        providerInstanceId,
      })
      return
    }
    const now = new Date()
    const timeSinceLastUpdate = now.getTime() - (entry.instance.timestamp ? entry.instance.timestamp.getTime() : 0)
    if (timeSinceLastUpdate > PROVIDER_CHECK_INTERVAL_MS) {
      // Mark status as unknown if we haven't received an update within the check interval
      const healthReport = await statusReport(entry.instance.connection)

      logger.info('Executed provider instance health check due to timeout', {
        providerInstanceId,
        workspaceId: entry.instance.workspaceId,
        modelProvider: entry.instance.modelProvider,
        timeSinceLastUpdate,
        healthReport,
      })

      if (healthReport.connectionErrorMessage) {
        logger.error('Health check request for provider instance did not succeed', {
          providerInstanceId,
          workspaceId: entry.instance.workspaceId,
          connection: entry.instance.connection,
          healthReport,
        })
      }
      await writeProviderInstance({
        version: 1,
        workspaceId: entry.instance.workspaceId,
        providerInstanceId,
        modelProvider: entry.instance.modelProvider,
        connection: entry.instance.connection,
        status: healthReport.isConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        loadedModelNames: healthReport.loadedModelNames,
        availableModelNames: healthReport.availableModelNames,
        totalMemoryMb: healthReport.totalMemoryMb,
        usedMemoryMb: healthReport.usedMemoryMb,
        processorUsagePercent: healthReport.processorUsagePercent,
      })
    } else {
      logger.debug('Skipping provider instance health check because recent update was received', {
        providerInstanceId,
        workspaceId: entry.instance.workspaceId,
        modelProvider: entry.instance.modelProvider,
        timeSinceLastUpdate,
      })
    }
  }, PROVIDER_CHECK_INTERVAL_MS)
}

export function removeFromCheckMap(providerInstanceId: string) {
  const existingEntry = providerInstancesMap.get(providerInstanceId)
  if (!existingEntry) {
    logger.warn('Attempting to remove provider instance id from check map that does not exist', {
      providerInstanceId,
    })
    return
  }
  clearTimeout(existingEntry.timeout)
  providerInstancesMap.delete(providerInstanceId)
}
