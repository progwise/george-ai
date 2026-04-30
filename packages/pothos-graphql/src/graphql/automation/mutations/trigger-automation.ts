import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain/src/access-control'

import { builder } from '../../builder'
import { triggerResult } from './trigger-result'

// Trigger an automation (run all in-scope items)
builder.mutationField('triggerAutomation', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: triggerResult,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_source, { id }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      // Verify automation exists and belongs to workspace
      const automation = await prisma.aiAutomation.findFirst({
        where: {
          id: String(id),
          workspaceId,
        },
        include: {
          items: {
            where: { inScope: true },
          },
        },
      })

      if (!automation) {
        return {
          success: false,
          message: 'Automation not found or access denied',
        }
      }

      if (automation.items.length === 0) {
        return {
          success: false,
          message: 'No items in scope for this automation',
        }
      }

      // Create a batch for this trigger
      const batch = await prisma.aiAutomationBatch.create({
        data: {
          automationId: String(id),
          status: 'PENDING',
          triggeredBy: 'MANUAL',
          itemsTotal: automation.items.length,
        },
      })

      // Mark all in-scope items as PENDING for this batch
      await prisma.aiAutomationItem.updateMany({
        where: {
          automationId: String(id),
          inScope: true,
        },
        data: {
          status: 'PENDING',
        },
      })

      return {
        success: true,
        message: `Triggered automation for ${automation.items.length} items`,
        batchId: batch.id,
      }
    },
  }),
)
