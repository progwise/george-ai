import { getConnectorTypeFactory } from '@george-ai/connector-types'

import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiConnectorTypeWorkspace, AiConnector')

builder.prismaObject('AiConnectorTypeWorkspace', {
  name: 'AiConnectorTypeWorkspace',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    connectorType: t.exposeString('connectorType', { nullable: false }),
    workspace: t.relation('workspace', { nullable: false }),
  }),
})

builder.prismaObject('AiConnector', {
  name: 'AiConnector',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    connectorType: t.exposeString('connectorType', { nullable: false }),
    baseUrl: t.exposeString('baseUrl', { nullable: false }),
    name: t.exposeString('name', { nullable: true }),
    // Expose config with sensitive fields removed
    configJson: t.string({
      nullable: false,
      resolve: (connector) => {
        const factory = getConnectorTypeFactory()
        const safeConfig = factory.getConfigForDisplay(
          connector.connectorType,
          connector.config as Record<string, unknown>,
        )
        return JSON.stringify(safeConfig)
      },
    }),
    displayName: t.string({
      nullable: false,
      resolve: (connector) => connector.name || connector.baseUrl,
    }),
    isConnected: t.exposeBoolean('isConnected', { nullable: false }),
    lastTestedAt: t.expose('lastTestedAt', { type: 'DateTime', nullable: true }),
    lastError: t.exposeString('lastError', { nullable: true }),
    workspace: t.relation('workspace', { nullable: false }),
    automations: t.relation('automations', { nullable: false }),
  }),
})
