/**
 * Automation item status values
 */
export const AUTOMATION_ITEM_STATUS = ['PENDING', 'SUCCESS', 'WARNING', 'FAILED', 'SKIPPED'] as const

/**
 * Batch status values
 */
export const BATCH_STATUS = ['PENDING', 'RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED'] as const

/**
 * Trigger type values
 */
export const TRIGGER_TYPE = ['MANUAL', 'ENRICHMENT', 'SCHEDULE'] as const
