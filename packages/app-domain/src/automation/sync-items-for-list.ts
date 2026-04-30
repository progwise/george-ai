import { prisma } from '@george-ai/app-database'

import { syncItems } from './sync-items'

/**
 * Sync automation items for all automations linked to a list.
 *
 * Called after list items are created/updated.
 */
export async function syncItemsForList(listId: string): Promise<{ automations: number; itemsSynced: number }> {
  // Get all automations for this list
  const automations = await prisma.aiAutomation.findMany({
    where: { listId },
    select: { id: true },
  })

  if (automations.length === 0) {
    return { automations: 0, itemsSynced: 0 }
  }

  let totalSynced = 0

  for (const automation of automations) {
    const result = await syncItems(automation.id)
    totalSynced += result.synced
  }

  return { automations: automations.length, itemsSynced: totalSynced }
}
