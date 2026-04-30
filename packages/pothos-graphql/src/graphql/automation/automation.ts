import { rawActionConfigSchema } from '@george-ai/connector-types'

import { builder } from '../builder'

builder.prismaObject('AiAutomation', {
  name: 'Automation',
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
      type: 'ConnectorActionConfig',
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
