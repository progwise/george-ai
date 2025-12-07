import type { ActionConfigValue, ActionFieldMapping, ConnectorActionConfig } from '@george-ai/connector-types'
import { rawActionConfigSchema } from '@george-ai/connector-types'

import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiAutomation, AiAutomationItem, AiAutomationItemExecution, AiAutomationBatch')

// Enums are defined in scalars/enums.ts

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
    status: t.expose('status', {
      type: 'AutomationItemStatus',
      nullable: false,
    }),
    automation: t.relation('automation', { nullable: false }),
    listItem: t.relation('listItem', { nullable: false }),
    executions: t.relation('executions', { nullable: false }),
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
