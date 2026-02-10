import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Toggle provider enabled/disabled
builder.mutationField('toggleModelProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiServiceProvider',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      enabled: t.arg.boolean({ required: true }),
    },
    resolve: async (query, _source, { id, enabled }, { workspaceId, session }) => {
      const userId = session.user.id
      await canAdminWorkspaceOrThrow(workspaceId, userId)

      const provider = await prisma.aiServiceProvider.update({
        ...query,
        where: { id, workspaceId },
        data: {
          enabled,
          updatedBy: userId,
        },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(workspaceId)

      return provider
    },
  }),
)
