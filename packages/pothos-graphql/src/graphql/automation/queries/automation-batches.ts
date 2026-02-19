import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get automation batches (execution history)
builder.queryField('automationBatches', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAutomationBatch'],
    nullable: { list: false, items: false },
    args: {
      automationId: t.arg.id({ required: true }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (query, _source, { automationId, skip, take }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify automation belongs to workspace
      const automation = await prisma.aiAutomation.findFirst({
        where: {
          id: String(automationId),
          workspaceId,
        },
      })

      if (!automation) {
        return []
      }

      return prisma.aiAutomationBatch.findMany({
        ...query,
        where: { automationId: String(automationId) },
        orderBy: [{ createdAt: 'desc' }],
        skip: skip ?? undefined,
        take: take ?? 20,
      })
    },
  }),
)
