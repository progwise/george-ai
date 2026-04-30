import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain/src/access-control'

import { builder } from '../../builder'
import { triggerResult } from './trigger-result'

// Trigger a single automation item
builder.mutationField('triggerAutomationItem', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: triggerResult,
    nullable: false,
    args: {
      automationItemId: t.arg.id({ required: true }),
    },
    resolve: async (_source, { automationItemId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify automation item exists and belongs to workspace
      const item = await prisma.aiAutomationItem.findFirst({
        where: {
          id: String(automationItemId),
          automation: {
            workspaceId,
          },
        },
        include: {
          automation: true,
        },
      })

      if (!item) {
        return {
          success: false,
          message: 'Automation item not found or access denied',
        }
      }

      // Create a batch for this single item trigger
      const batch = await prisma.aiAutomationBatch.create({
        data: {
          automationId: item.automationId,
          status: 'PENDING',
          triggeredBy: 'MANUAL',
          itemsTotal: 1,
        },
      })

      // Mark item as PENDING
      await prisma.aiAutomationItem.update({
        where: { id: String(automationItemId) },
        data: { status: 'PENDING' },
      })

      return {
        success: true,
        message: 'Triggered single item execution',
        batchId: batch.id,
      }
    },
  }),
)
