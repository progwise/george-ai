import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getRegistryEntries } from '@george-ai/event-service-client'

import { builder } from '../../builder'

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
