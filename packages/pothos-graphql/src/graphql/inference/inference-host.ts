import { decryptValue } from '@george-ai/app-commons'
import { InferenceHostConfig, InferenceHostState, getState } from '@george-ai/event-service-client'

import { builder } from '../builder'

builder.objectRef<InferenceHostConfig>('InferenceHostConfig').implement({
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    hostId: t.exposeString('hostId', { nullable: false }),
    driver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (config) => config.connection.driver }),
    name: t.exposeString('name', { nullable: true }),
    enabled: t.exposeBoolean('enabled', { nullable: false }),
    connection: t.expose('connection', { type: 'InferenceHostConnection', nullable: false }),
    apiKeyHint: t.string({
      nullable: true,
      resolve: ({ connection }) => {
        if (!connection.encryptedApiKey) return null
        const key = decryptValue(connection.encryptedApiKey)
        if (key.length <= 10) {
          // For short keys, show first 2 and last 2
          return `${key.slice(0, 2)}...${key.slice(-2)}`
        }
        // For longer keys, show first 3 and last 2
        return `${key.slice(0, 3)}...${key.slice(-2)}`
      },
    }),
    url: t.field({ type: 'String', nullable: true, resolve: (config) => config.connection.baseUrl }),
    configuredVramGb: t.exposeInt('configuredVramGb', { nullable: true }),
    lastUpdate: t.expose('lastUpdate', { type: 'DateTime', nullable: true }),
  }),
})

builder.objectRef<InferenceHostState>('InferenceHostState').implement({
  fields: (t) => ({
    hostId: t.exposeString('hostId', { nullable: false }),
    state: t.exposeString('state', { nullable: false }),
    driver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (parent) => parent.connection.driver }),
    url: t.field({ type: 'String', nullable: true, resolve: (parent) => parent.connection.baseUrl }),
    apiKey: t.field({ type: 'String', nullable: true, resolve: (parent) => parent.connection.encryptedApiKey }),
    totalMemoryMb: t.exposeInt('totalMemoryMb'),
    usedMemoryMb: t.exposeInt('usedMemoryMb'),
    processorUsagePercent: t.exposeInt('processorUsagePercent'),
    lastHealthCheck: t.expose('lastHealthCheck', { type: 'DateTime' }),
    lastTestConnection: t.expose('lastTestConnection', { type: 'DateTime' }),
    models: t.field({
      type: ['InferenceModelState'],
      nullable: true,
      resolve: async (root) => {
        const modelStates = await getState({
          type: 'inferenceModel',
          workspaceId: root.workspaceId,
          hostId: root.hostId,
        })
        return modelStates
      },
    }),
  }),
})
