import { builder } from '../builder'

builder.prismaObject('AiAutomationBatch', {
  name: 'AutomationBatch',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    automationId: t.exposeString('automationId', { nullable: false }),
    status: t.expose('status', {
      type: 'AutomationBatchStatus',
      nullable: false,
    }),
    triggeredBy: t.expose('triggeredBy', {
      type: 'AutomationTriggerType',
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
