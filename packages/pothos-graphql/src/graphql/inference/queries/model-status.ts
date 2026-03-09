import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { InferenceModelState, getState } from '@george-ai/event-service-client'

import { builder } from '../../builder'

builder.objectRef<InferenceModelState>('InferenceModelState').implement({
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId'),
    hostId: t.exposeString('hostId'),
    loadState: t.exposeString('loadState'),
    driver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (parent) => parent.connection.driver }),
    modelName: t.exposeString('modelName'),
    callCount: t.exposeInt('callCount'),
    errorCount: t.exposeInt('errorCount'),
    responseTimeMsPerToken: t.exposeInt('responseTimeMsPerToken'),
  }),
})
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
