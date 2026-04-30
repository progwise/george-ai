import { builder } from '../builder'

builder.prismaObject('AiAutomationItemExecution', {
  name: 'AutomationItemExecution',
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
