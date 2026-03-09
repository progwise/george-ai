import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceHostConfig, getRegistryEntries } from '@george-ai/event-service-client'

import { builder } from '../../builder'

// Overall cluster status
builder.objectRef<InferenceHostConfig>('InferenceHostConfig').implement({
  fields: (t) => ({
    hostId: t.exposeString('hostId', { nullable: false }),
    name: t.exposeString('name'),
    driver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (parent) => parent.connection.driver }),
    url: t.field({ type: 'String', nullable: true, resolve: (parent) => parent.connection.baseUrl }),
    apiKey: t.field({ type: 'String', nullable: true, resolve: (parent) => parent.connection.encryptedApiKey }),
    lastUpdate: t.expose('lastUpdate', { type: 'DateTime' }),
  }),
})

// Query resolver for AI service status (workspace-scoped)
builder.queryField('inferenceHostConfig', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['InferenceHostConfig'],
    nullable: false,
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const hostStates = await getRegistryEntries({ type: 'inference-host', workspaceId })
      return hostStates
    },
  }),
)
