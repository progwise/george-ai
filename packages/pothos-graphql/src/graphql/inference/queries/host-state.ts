import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { getState } from '@george-ai/event-service-client'

import { builder } from '../../builder'

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
