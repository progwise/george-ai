import { canAdminWorkspaceOrThrow, removeInferenceHost } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Delete an AI service provider
builder.mutationField('removeInferenceHost', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      hostId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { hostId }, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)

      await removeInferenceHost({ workspaceId, hostId })
      return true
    },
  }),
)
