import { getConnectorAction, getConnectorTypeFactory, rawActionConfigSchema } from '@george-ai/connector-types'
import type { ActionInput, ConnectorConfig } from '@george-ai/connector-types'
import { createLogger } from '@george-ai/web-utils'

import type { AiAutomationItem, AiAutomationItemExecution, AiListItemCache } from '../../prisma/generated/client'
import { prisma } from '../prisma'

const logger = createLogger('Automation Worker')

let isWorkerRunning = false
let workerInterval: NodeJS.Timeout | null = null

const WORKER_INTERVAL_MS = 2000 // Process queue every 2 seconds
const BATCH_SIZE = 5 // Process up to 5 items at a time
const MAX_CONCURRENT_EXECUTIONS = 3 // Maximum concurrent action executions

interface AutomationItemWithRelations extends AiAutomationItem {
  automation: {
    id: string
    connectorAction: string
    connectorActionConfig: unknown
    connector: {
      id: string
      connectorType: string
      baseUrl: string
      config: unknown
    }
  }
  listItem: {
    id: string
    itemName: string
    cache: AiListItemCache[]
  }
}

/**
 * Process a single automation item
 */
async function processAutomationItem(
  item: AutomationItemWithRelations,
  batchId: string,
): Promise<AiAutomationItemExecution> {
  const startedAt = new Date()

  try {
    // Mark item as PROCESSING using atomic updateMany for race safety
    // Only succeeds if item is still PENDING - prevents duplicate processing
    const updated = await prisma.aiAutomationItem.updateMany({
      where: {
        id: item.id,
        status: 'PENDING',
      },
      data: {
        status: 'PROCESSING',
      },
    })

    if (updated.count === 0) {
      logger.debug(`Automation item ${item.id} no longer pending, skipping`)
      // Return a skipped execution record
      return prisma.aiAutomationItemExecution.create({
        data: {
          automationItemId: item.id,
          batchId,
          status: 'SKIPPED',
          input: {},
          output: { message: 'Item was already processed' },
          startedAt,
          finishedAt: new Date(),
        },
      })
    }

    // Build field values map from cache
    const fieldValues: Record<string, string | number | boolean | null> = {}
    for (const cache of item.listItem.cache) {
      // Use the appropriate value based on what's populated
      if (cache.valueString !== null) {
        fieldValues[cache.fieldId] = cache.valueString
      } else if (cache.valueNumber !== null) {
        fieldValues[cache.fieldId] = cache.valueNumber
      } else if (cache.valueBoolean !== null) {
        fieldValues[cache.fieldId] = cache.valueBoolean
      } else if (cache.valueDate !== null) {
        fieldValues[cache.fieldId] = cache.valueDate.toISOString()
      }
    }

    // Check for missing field values in mapped fields
    const actionConfig = rawActionConfigSchema.safeParse(item.automation.connectorActionConfig)
    if (actionConfig.success && actionConfig.data.fieldMappings.length > 0) {
      const missingFields: string[] = []
      for (const mapping of actionConfig.data.fieldMappings) {
        const value = fieldValues[mapping.sourceFieldId]
        if (value === undefined || value === null || value === '') {
          missingFields.push(mapping.targetField)
        }
      }

      if (missingFields.length > 0) {
        // Reset item status back to PENDING so it can be processed later when values are available
        await prisma.aiAutomationItem.update({
          where: { id: item.id },
          data: { status: 'SKIPPED' },
        })

        logger.info(`⊘ Item ${item.listItem.itemName} skipped: Missing values for fields: ${missingFields.join(', ')}`)

        return prisma.aiAutomationItemExecution.create({
          data: {
            automationItemId: item.id,
            batchId,
            status: 'SKIPPED',
            input: { fieldValues, missingFields },
            output: { message: `Missing values for fields: ${missingFields.join(', ')}` },
            startedAt,
            finishedAt: new Date(),
          },
        })
      }
    }

    // Prepare connector config with decrypted credentials
    const factory = getConnectorTypeFactory()
    const decryptedCredentials = factory.prepareConfigForUse(
      item.automation.connector.connectorType,
      item.automation.connector.config as Record<string, unknown>,
    )

    const connectorConfig: ConnectorConfig = {
      baseUrl: item.automation.connector.baseUrl,
      credentials: decryptedCredentials,
    }

    // Prepare action input
    const actionInput: ActionInput = {
      item: {
        id: item.listItem.id,
        name: item.listItem.itemName,
        fieldValues,
      },
      actionConfig: item.automation.connectorActionConfig as Record<string, unknown>,
    }

    // Get the connector action
    const action = getConnectorAction(item.automation.connector.connectorType, item.automation.connectorAction)

    if (!action) {
      throw new Error(
        `Action ${item.automation.connectorAction} not found for connector type ${item.automation.connector.connectorType}`,
      )
    }

    // Execute the action
    const result = await action.execute(connectorConfig, actionInput)

    // Map result status to AutomationItemStatus
    const status = result.status === 'success' ? 'SUCCESS' : result.status === 'skipped' ? 'SKIPPED' : 'FAILED'

    // Update item status
    logger.debug(`Updating item ${item.id} status to ${status}`)
    await prisma.aiAutomationItem.update({
      where: { id: item.id },
      data: { status },
    })
    logger.debug(`Item ${item.id} status updated to ${status}`)

    // Create execution record
    const execution = await prisma.aiAutomationItemExecution.create({
      data: {
        automationItemId: item.id,
        batchId,
        status,
        input: actionInput as object,
        output: result as object,
        startedAt,
        finishedAt: new Date(),
      },
    })

    // Log at INFO level so action results are visible
    if (status === 'SUCCESS') {
      logger.info(`✓ Item ${item.listItem.itemName}: ${result.message || 'Success'}`)
    } else if (status === 'SKIPPED') {
      logger.info(`⊘ Item ${item.listItem.itemName} skipped: ${result.message || 'No message'}`)
    } else {
      // Show both message and error for failed actions
      const errorDetail = result.error ? ` (${result.error})` : ''
      logger.info(`✗ Item ${item.listItem.itemName} failed: ${result.message || 'Unknown error'}${errorDetail}`)
    }
    logger.debug(`Item ${item.id} status changed to: ${status}`)

    return execution
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error(`Error processing automation item ${item.id}: ${errorMessage}`)

    // Update item status to failed
    await prisma.aiAutomationItem.update({
      where: { id: item.id },
      data: { status: 'FAILED' },
    })

    // Create execution record with error
    return prisma.aiAutomationItemExecution.create({
      data: {
        automationItemId: item.id,
        batchId,
        status: 'FAILED',
        input: {},
        output: { error: errorMessage },
        startedAt,
        finishedAt: new Date(),
      },
    })
  }
}

/**
 * Process automation batches
 */
async function processBatches() {
  if (!isWorkerRunning) return

  try {
    // Find PENDING or RUNNING batches
    const batches = await prisma.aiAutomationBatch.findMany({
      where: {
        status: { in: ['PENDING', 'RUNNING'] },
      },
      take: BATCH_SIZE,
      orderBy: { createdAt: 'asc' },
    })

    if (batches.length === 0) {
      return
    }

    for (const batch of batches) {
      // If batch is PENDING, mark it as RUNNING
      if (batch.status === 'PENDING') {
        await prisma.aiAutomationBatch.update({
          where: { id: batch.id },
          data: {
            status: 'RUNNING',
            startedAt: new Date(),
          },
        })
      }

      // Get pending items for this batch's automation
      const pendingItems = await prisma.aiAutomationItem.findMany({
        where: {
          automationId: batch.automationId,
          inScope: true,
          status: 'PENDING',
        },
        take: Math.min(BATCH_SIZE, MAX_CONCURRENT_EXECUTIONS),
        include: {
          automation: {
            select: {
              id: true,
              connectorAction: true,
              connectorActionConfig: true,
              connector: {
                select: {
                  id: true,
                  connectorType: true,
                  baseUrl: true,
                  config: true,
                },
              },
            },
          },
          listItem: {
            select: {
              id: true,
              itemName: true,
              cache: true,
            },
          },
        },
      })

      if (pendingItems.length === 0) {
        // No more pending items - check if batch is complete
        const remainingPending = await prisma.aiAutomationItem.count({
          where: {
            automationId: batch.automationId,
            inScope: true,
            status: 'PENDING',
          },
        })

        if (remainingPending === 0) {
          // All items processed - finalize batch using execution records for THIS batch
          const stats = await prisma.aiAutomationItemExecution.groupBy({
            by: ['status'],
            where: {
              batchId: batch.id, // Only count executions for THIS batch
            },
            _count: true,
          })

          const statusCounts = stats.reduce(
            (acc, s) => {
              acc[s.status] = s._count
              return acc
            },
            {} as Record<string, number>,
          )

          const hasFailures = (statusCounts['FAILED'] || 0) > 0
          const hasWarnings = (statusCounts['WARNING'] || 0) > 0

          await prisma.aiAutomationBatch.update({
            where: { id: batch.id },
            data: {
              status: hasFailures ? 'COMPLETED_WITH_ERRORS' : hasWarnings ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED',
              itemsProcessed: batch.itemsTotal,
              itemsSuccess: statusCounts['SUCCESS'] || 0,
              itemsWarning: statusCounts['WARNING'] || 0,
              itemsFailed: statusCounts['FAILED'] || 0,
              itemsSkipped: statusCounts['SKIPPED'] || 0,
              finishedAt: new Date(),
            },
          })

          logger.info(`Batch ${batch.id} completed`)
        }
        continue
      }

      logger.info(`Processing ${pendingItems.length} automation items for batch ${batch.id}`)

      // Process items in parallel
      const executions = await Promise.all(
        pendingItems.map((item) => processAutomationItem(item as AutomationItemWithRelations, batch.id)),
      )

      // Update batch progress
      const successCount = executions.filter((e) => e.status === 'SUCCESS').length
      const warningCount = executions.filter((e) => e.status === 'WARNING').length
      const failedCount = executions.filter((e) => e.status === 'FAILED').length
      const skippedCount = executions.filter((e) => e.status === 'SKIPPED').length

      await prisma.aiAutomationBatch.update({
        where: { id: batch.id },
        data: {
          itemsProcessed: { increment: executions.length },
          itemsSuccess: { increment: successCount },
          itemsWarning: { increment: warningCount },
          itemsFailed: { increment: failedCount },
          itemsSkipped: { increment: skippedCount },
        },
      })
    }
  } catch (error) {
    logger.error('Error processing automation batches:', error)
  }
}

/**
 * Reset orphaned RUNNING batches from previous server sessions
 */
async function resetOrphanedBatches() {
  try {
    // Reset any batches that were stuck in RUNNING status
    const resetBatches = await prisma.aiAutomationBatch.updateMany({
      where: {
        status: 'RUNNING',
      },
      data: {
        status: 'PENDING',
        startedAt: null,
      },
    })

    if (resetBatches.count > 0) {
      logger.info(`Reset ${resetBatches.count} orphaned automation batches back to pending`)
    }

    // Reset any items that were stuck in PROCESSING state from previous server sessions
    const resetItems = await prisma.aiAutomationItem.updateMany({
      where: {
        status: 'PROCESSING',
      },
      data: {
        status: 'PENDING',
      },
    })

    if (resetItems.count > 0) {
      logger.info(`Reset ${resetItems.count} orphaned automation items back to pending`)
    }
  } catch (error) {
    logger.error('Error resetting orphaned automation batches:', error)
  }
}

/**
 * Start the automation queue worker
 */
export async function startAutomationQueueWorker() {
  if (isWorkerRunning) {
    logger.warn('Automation queue worker is already running')
    return
  }

  isWorkerRunning = true
  logger.info('Starting automation queue worker...')

  // First, reset any orphaned batches from previous server sessions
  await resetOrphanedBatches()

  // Process batches immediately
  await processBatches()

  // Set up interval to process batches
  workerInterval = setInterval(async () => {
    await processBatches()
  }, WORKER_INTERVAL_MS)
}

/**
 * Stop the automation queue worker
 */
export function stopAutomationQueueWorker() {
  if (!isWorkerRunning) {
    logger.warn('Automation queue worker is not running')
    return
  }

  isWorkerRunning = false

  if (workerInterval) {
    clearInterval(workerInterval)
    workerInterval = null
  }

  logger.info('Stopped automation queue worker')
}

/**
 * Check if the automation worker is running
 */
export function isAutomationWorkerRunning(): boolean {
  return isWorkerRunning
}
