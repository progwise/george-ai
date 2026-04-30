/**
 * Automation item status values
 */
export const AUTOMATION_ITEM_STATUS = ['PENDING', 'PROCESSING', 'SUCCESS', 'WARNING', 'FAILED', 'SKIPPED'] as const
export type AutomationItemStatus = (typeof AUTOMATION_ITEM_STATUS)[number]

/**
 * Batch status values
 */
export const AUTOMATION_BATCH_STATUS = ['PENDING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'] as const
export type AutomationBatchStatus = (typeof AUTOMATION_BATCH_STATUS)[number]
/**
 * Trigger type values
 */
export const AUTOMATION_TRIGGER_TYPE = ['MANUAL', 'ENRICHMENT', 'SCHEDULE'] as const
export type AutomationTriggerType = (typeof AUTOMATION_TRIGGER_TYPE)[number]
