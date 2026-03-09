import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceHostState, getState } from '@george-ai/event-service-client'

import { builder } from '../../builder'

// Overall cluster status
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

// Query resolver for AI service status (workspace-scoped)
builder.queryField('inferenceHostState', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['InferenceHostState'],
    nullable: false,
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const hostStates = await getState({ type: 'inferenceHost', workspaceId })
      return hostStates
    },
  }),
)
