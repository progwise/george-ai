import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Delete an automation
builder.mutationField('deleteAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify automation exists and belongs to workspace
      const existing = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId,
        },
      })

      if (!existing) {
        throw new GraphQLError('Automation not found or access denied')
      }

      await prisma.aiAutomation.delete({
        where: { id: String(id) },
      })

      return true
    },
  }),
)
