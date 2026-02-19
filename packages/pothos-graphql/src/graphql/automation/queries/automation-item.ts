import { GraphQLError } from 'graphql'

import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get a single automation item by ID
builder.queryField('automationItem', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomationItem',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _source, { id }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const item = await prisma.aiAutomationItem.findFirstOrThrow({
        ...query,
        where: { id: String(id) },
        include: {
          automation: true,
        },
      })

      // Verify automation belongs to workspace
      if (!item || item.automation.workspaceId !== workspaceId) {
        throw new GraphQLError('Automation item not found or access denied')
      }

      return item
    },
  }),
)
