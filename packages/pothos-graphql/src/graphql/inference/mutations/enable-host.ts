import { canAdminWorkspaceOrThrow, toggleInferenceHostEnabled } from '@george-ai/app-domain'

import { builder } from '../../builder'

builder.mutationField('enableInferenceHost', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceHostConfig',
    nullable: false,
    args: {
      hostId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { hostId }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      const config = await toggleInferenceHostEnabled({ workspaceId, hostId, enabled: true })

      return config
    },
  }),
)

builder.mutationField('disableInferenceHost', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceHostConfig',
    nullable: false,
    args: {
      hostId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { hostId }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)
      const config = await toggleInferenceHostEnabled({ workspaceId, hostId, enabled: false })

      return config
    },
  }),
)
