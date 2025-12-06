import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiAutomation, AiAutomationItem, AiAutomationItemExecution, AiAutomationBatch')

// Enums are defined in scalars/enums.ts

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
    connectorActionConfigJson: t.string({
      nullable: false,
      resolve: (automation) => JSON.stringify(automation.connectorActionConfig),
    }),
    schedule: t.exposeString('schedule', { nullable: true }),
    executeOnEnrichment: t.exposeBoolean('executeOnEnrichment', { nullable: false }),
    workspace: t.relation('workspace', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    connector: t.relation('connector', { nullable: false }),
    items: t.relation('items', { nullable: false }),
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
