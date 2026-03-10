import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { encryptValue } from '@george-ai/app-commons'
import { canAdminWorkspaceOrThrow, updateInferenceHost } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Update an existing AI service provider
builder.mutationField('updateInferenceHost', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'InferenceHostConfig',
    nullable: false,
    args: {
      hostId: t.arg.id({ required: true }),
      data: t.arg({ type: 'InferenceHostInput', required: true }),
    },
    resolve: async (_source, { hostId, data }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      const config = await updateInferenceHost({
        workspaceId,
        hostId,
        name: data.name,
        baseUrl: data.baseUrl,
        apiKey: data.apiKey ? encryptValue(data.apiKey) : undefined,
        configuredVramGb: data.vramGb ?? undefined,
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(workspaceId)

      return config
    },
  }),
)
