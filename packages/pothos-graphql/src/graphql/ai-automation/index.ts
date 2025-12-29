import { prisma } from '@george-ai/app-domain'
import type {
  ActionConfigValue,
  ActionFieldMapping,
  ConnectorActionConfig,
  TransformType,
} from '@george-ai/connector-types'
import { rawActionConfigSchema, transformValue } from '@george-ai/connector-types'

import { getFieldValue } from '../../domain'
import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiAutomation, AiAutomationItem, AiAutomationItemExecution, AiAutomationBatch')

// Enums are defined in scalars/enums.ts

// Preview value type for automation items
interface AutomationPreviewValueData {
  targetField: string
  value: string | null
  transformedValue: string | null
  isMissing: boolean
}

const AutomationPreviewValueType = builder.objectRef<AutomationPreviewValueData>('AutomationPreviewValue').implement({
  description: 'Preview of a value that will be written to the target system',
  fields: (t) => ({
    targetField: t.exposeString('targetField', { nullable: false }),
    value: t.exposeString('value', { nullable: true }),
    transformedValue: t.exposeString('transformedValue', { nullable: true }),
    isMissing: t.exposeBoolean('isMissing', { nullable: false }),
  }),
})

// Generic action config types
const ActionConfigValueType = builder.objectRef<ActionConfigValue>('ActionConfigValue').implement({
  description: 'A key-value pair for action configuration',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: true }),
  }),
})

const ActionFieldMappingType = builder.objectRef<ActionFieldMapping>('ActionFieldMapping').implement({
  description: 'Maps a source enrichment field to a target field with transform',
  fields: (t) => ({
    sourceFieldId: t.exposeString('sourceFieldId', { nullable: false }),
    targetField: t.exposeString('targetField', { nullable: false }),
    transform: t.exposeString('transform', { nullable: false }),
  }),
})

const ConnectorActionConfigType = builder.objectRef<ConnectorActionConfig>('ConnectorActionConfig').implement({
  description: 'Generic configuration for connector actions',
  fields: (t) => ({
    values: t.field({
      type: [ActionConfigValueType],
      nullable: { list: false, items: false },
      resolve: (config) => config.values,
    }),
    fieldMappings: t.field({
      type: [ActionFieldMappingType],
      nullable: { list: false, items: false },
      resolve: (config) => config.fieldMappings,
    }),
  }),
})

builder.prismaObject('AiAutomation', {
  name: 'AiAutomation',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    connectorId: t.exposeString('connectorId', { nullable: false }),
    connectorAction: t.exposeString('connectorAction', { nullable: false }),
    connectorActionConfig: t.field({
      type: ConnectorActionConfigType,
      nullable: false,
      resolve: (automation) => rawActionConfigSchema.parse(automation.connectorActionConfig),
    }),
    schedule: t.exposeString('schedule', { nullable: true }),
    executeOnEnrichment: t.exposeBoolean('executeOnEnrichment', { nullable: false }),
    workspace: t.relation('workspace', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    connector: t.relation('connector', { nullable: false }),
    batches: t.relation('batches', { nullable: false }),
  }),
})

builder.prismaObject('AiAutomationItem', {
  name: 'AiAutomationItem',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    automationId: t.exposeString('automationId', { nullable: false }),
    listItemId: t.exposeString('listItemId', { nullable: false }),
    inScope: t.exposeBoolean('inScope', { nullable: false }),
    // Derive status from latest execution to ensure consistency
    status: t.field({
      type: 'AutomationItemStatus',
      nullable: false,
      resolve: async (item) => {
        // Get the latest execution for this item
        const lastExecution = await prisma.aiAutomationItemExecution.findFirst({
          where: { automationItemId: item.id },
          orderBy: { startedAt: 'desc' },
          select: { status: true },
        })
        // If there's an execution, use its status; otherwise use the stored status
        return lastExecution?.status ?? item.status
      },
    }),
    automation: t.relation('automation', { nullable: false }),
    listItem: t.relation('listItem', { nullable: false }),
    executions: t.relation('executions', { nullable: false, query: { orderBy: { startedAt: 'desc' } } }),
    lastExecutedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: async (item) => {
        const lastExecution = await prisma.aiAutomationItemExecution.findFirst({
          where: { automationItemId: item.id, finishedAt: { not: null } },
          orderBy: { finishedAt: 'desc' },
          select: { finishedAt: true },
        })
        return lastExecution?.finishedAt ?? null
      },
    }),
    preview: t.field({
      type: [AutomationPreviewValueType],
      nullable: { list: false, items: false },
      resolve: async (item) => {
        // Get automation with config
        const automation = await prisma.aiAutomation.findUnique({
          where: { id: item.automationId },
          select: { connectorActionConfig: true, listId: true },
        })
        if (!automation) return []

        const config = rawActionConfigSchema.safeParse(automation.connectorActionConfig)
        if (!config.success || config.data.fieldMappings.length === 0) return []

        // Get list item with field values (matching ListItemWithRelations type)
        const listItem = await prisma.aiListItem.findUnique({
          where: { id: item.listItemId },
          include: {
            cache: true,
            sourceFile: {
              include: {
                contentExtractionTasks: { select: { extractionFinishedAt: true } },
                crawledByCrawler: { select: { uri: true } },
                library: { select: { name: true } },
              },
            },
          },
        })
        if (!listItem) return []

        // Get field definitions for the mapped source fields
        const sourceFieldIds = config.data.fieldMappings.map((m) => m.sourceFieldId)
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: sourceFieldIds } },
          select: { id: true, name: true, type: true, sourceType: true, fileProperty: true },
        })

        // Build preview values
        return config.data.fieldMappings.map((mapping) => {
          const field = fields.find((f) => f.id === mapping.sourceFieldId)
          if (!field) {
            return { targetField: mapping.targetField, value: null, transformedValue: null, isMissing: true }
          }

          const { value } = getFieldValue(listItem, field)
          // A value of '-' from getFieldValue means no cache record exists
          // null or empty string also means missing
          const isMissing = value === null || value === '-' || value === ''
          // Truncate long values for table preview
          const truncatedValue = value && value !== '-' && value.length > 100 ? `${value.slice(0, 100)}...` : value
          // Apply transform for drawer preview
          const transformed = transformValue(value, mapping.transform as TransformType)
          const transformedValue = transformed != null ? String(transformed) : null

          return {
            targetField: mapping.targetField,
            value: isMissing ? null : truncatedValue,
            transformedValue: isMissing ? null : transformedValue,
            isMissing,
          }
        })
      },
    }),
    hasIncompleteData: t.field({
      type: 'Boolean',
      nullable: false,
      description: 'True if any mapped field is missing a value',
      resolve: async (item) => {
        // Get automation with config
        const automation = await prisma.aiAutomation.findUnique({
          where: { id: item.automationId },
          select: { connectorActionConfig: true },
        })
        if (!automation) return false

        const config = rawActionConfigSchema.safeParse(automation.connectorActionConfig)
        if (!config.success || config.data.fieldMappings.length === 0) return false

        // Get list item with cache
        const listItem = await prisma.aiListItem.findUnique({
          where: { id: item.listItemId },
          include: {
            cache: true,
            sourceFile: {
              include: {
                contentExtractionTasks: { select: { extractionFinishedAt: true } },
                crawledByCrawler: { select: { uri: true } },
                library: { select: { name: true } },
              },
            },
          },
        })
        if (!listItem) return true // Item doesn't exist, consider incomplete

        // Get field definitions
        const sourceFieldIds = config.data.fieldMappings.map((m) => m.sourceFieldId)
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: sourceFieldIds } },
          select: { id: true, name: true, type: true, sourceType: true, fileProperty: true },
        })

        // Check if any mapped field is missing a value
        for (const mapping of config.data.fieldMappings) {
          const field = fields.find((f) => f.id === mapping.sourceFieldId)
          if (!field) return true // Field definition not found

          const { value } = getFieldValue(listItem, field)
          if (value === null || value === '-' || value === '') {
            return true // Missing value
          }
        }

        return false
      },
    }),
  }),
})

builder.prismaObject('AiAutomationItemExecution', {
  name: 'AiAutomationItemExecution',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    automationItemId: t.exposeString('automationItemId', { nullable: false }),
    batchId: t.exposeString('batchId', { nullable: true }),
    status: t.expose('status', {
      type: 'AutomationItemStatus',
      nullable: false,
    }),
    // input/output JSON fields exposed as strings for client flexibility
    inputJson: t.string({
      nullable: false,
      resolve: (execution) => JSON.stringify(execution.input),
    }),
    outputJson: t.string({
      nullable: true,
      resolve: (execution) => (execution.output ? JSON.stringify(execution.output) : null),
    }),
    startedAt: t.expose('startedAt', { type: 'DateTime', nullable: false }),
    finishedAt: t.expose('finishedAt', { type: 'DateTime', nullable: true }),
    automationItem: t.relation('automationItem', { nullable: false }),
    batch: t.relation('batch', { nullable: true }),
  }),
})

builder.prismaObject('AiAutomationBatch', {
  name: 'AiAutomationBatch',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    automationId: t.exposeString('automationId', { nullable: false }),
    status: t.expose('status', {
      type: 'BatchStatus',
      nullable: false,
    }),
    triggeredBy: t.expose('triggeredBy', {
      type: 'TriggerType',
      nullable: false,
    }),
    itemsTotal: t.exposeInt('itemsTotal', { nullable: false }),
    itemsProcessed: t.exposeInt('itemsProcessed', { nullable: false }),
    itemsSuccess: t.exposeInt('itemsSuccess', { nullable: false }),
    itemsWarning: t.exposeInt('itemsWarning', { nullable: false }),
    itemsFailed: t.exposeInt('itemsFailed', { nullable: false }),
    itemsSkipped: t.exposeInt('itemsSkipped', { nullable: false }),
    startedAt: t.expose('startedAt', { type: 'DateTime', nullable: true }),
    finishedAt: t.expose('finishedAt', { type: 'DateTime', nullable: true }),
    automation: t.relation('automation', { nullable: false }),
    executions: t.relation('executions', { nullable: false }),
  }),
})
