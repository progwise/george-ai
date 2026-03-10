import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getState } from '@george-ai/event-service-client'

import { builder } from '../../builder'

// Query resolver for AI service status (workspace-scoped)
builder.queryField('inferenceModelState', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ['InferenceModelState'],
    nullable: false,
    resolve: async (_parent, _args, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const hostStates = await getState({ type: 'inferenceModel', workspaceId })
      return hostStates
    },
  }),
)
