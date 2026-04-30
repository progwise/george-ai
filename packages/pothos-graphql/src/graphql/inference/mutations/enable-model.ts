import { canWriteWorkspaceOrThrow, toggleInferenceModelEnabled } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('enableModel', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceModel',
    args: {
      driver: t.arg({ type: 'InferenceDriver', required: true }),
      modelName: t.arg.id({ required: true }),
    },
    resolve: async (_root, { driver, modelName }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await toggleInferenceModelEnabled({ driver, modelName, workspaceId, enabled: true })
    },
  }),
)

builder.mutationField('disableModel', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceModel',
    args: {
      driver: t.arg({ type: 'InferenceDriver', required: true }),
      modelName: t.arg.id({ required: true }),
    },
    resolve: async (_root, { driver, modelName }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await toggleInferenceModelEnabled({ driver, modelName, workspaceId, enabled: false })
    },
  }),
)
