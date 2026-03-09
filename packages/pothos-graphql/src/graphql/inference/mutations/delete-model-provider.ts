import { GraphQLError } from 'graphql'

import { invalidateWorkspace } from '@george-ai/ai-service-client'
import { prisma } from '@george-ai/app-database'
import { canAdminWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Delete an AI service provider
builder.mutationField('deleteModelProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, { workspaceId, session }) => {
      await canAdminWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify provider exists and belongs to workspace
      const existing = await prisma.aiServiceProvider.findFirst({
        where: {
          id: String(id),
          workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Provider not found or access denied')
      }

      // TODO: Check for dependencies (libraries, assistants using this provider)
      // For now, just delete (cascade will handle relations if any)

      await prisma.aiServiceProvider.delete({
        where: { id: String(id) },
      })

      // Invalidate provider cache for this workspace
      invalidateWorkspace(workspaceId)

      return true
    },
  }),
)
