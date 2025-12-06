/**
 * Automation item sync logic.
 *
 * Syncs list items to automation items, respecting filters.
 * Creates AiAutomationItem records for matching list items.
 */
import { prisma } from '../../prisma'

/**
 * Sync automation items for an automation.
 *
 * Creates/updates AiAutomationItem records for all items in the linked list.
 * - New list items get new automation items (PENDING status)
 * - Existing automation items are preserved (keeps status/history)
 * - Filter is evaluated to set inScope field
 *
 * @returns Count of items synced and total items
 */
export async function syncAutomationItems(
  automationId: string,
): Promise<{ synced: number; total: number; inScope: number }> {
  // Get automation with filter config
  const automation = await prisma.aiAutomation.findUniqueOrThrow({
    where: { id: automationId },
    select: {
      id: true,
      listId: true,
      filter: true,
    },
  })

  // Get all list items for this list
  const listItems = await prisma.aiListItem.findMany({
    where: { listId: automation.listId },
    select: { id: true },
  })

  if (listItems.length === 0) {
    return { synced: 0, total: 0, inScope: 0 }
  }

  // Get existing automation items
  const existingItems = await prisma.aiAutomationItem.findMany({
    where: { automationId },
    select: { listItemId: true },
  })
  const existingItemIds = new Set(existingItems.map((item) => item.listItemId))

  // For now, all items are in scope (filter evaluation deferred to Phase 2)
  // TODO: Implement filter evaluation when filter format is defined
  const inScope = true

  // Create new automation items for list items that don't have one yet
  let syncedCount = 0
  let inScopeCount = 0

  for (const listItem of listItems) {
    if (!existingItemIds.has(listItem.id)) {
      await prisma.aiAutomationItem.create({
        data: {
          automationId,
          listItemId: listItem.id,
          inScope,
          status: 'PENDING',
        },
      })
      syncedCount++
    }

    if (inScope) {
      inScopeCount++
    }
  }

  return { synced: syncedCount, total: listItems.length, inScope: inScopeCount }
}

/**
 * Sync automation items for all automations linked to a list.
 *
 * Called after list items are created/updated.
 */
export async function syncAutomationItemsForList(
  listId: string,
): Promise<{ automations: number; itemsSynced: number }> {
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
    const result = await syncAutomationItems(automation.id)
    totalSynced += result.synced
  }

  return { automations: automations.length, itemsSynced: totalSynced }
}

/**
 * Remove automation items that no longer have a corresponding list item.
 *
 * This is a safety net - CASCADE delete should handle this in most cases.
 */
export async function cleanupOrphanedAutomationItems(automationId: string): Promise<{ deleted: number }> {
  const automation = await prisma.aiAutomation.findUnique({
    where: { id: automationId },
    select: { listId: true },
  })

  if (!automation) {
    return { deleted: 0 }
  }

  // Get list item IDs that exist
  const listItems = await prisma.aiListItem.findMany({
    where: { listId: automation.listId },
    select: { id: true },
  })
  const validListItemIds = new Set(listItems.map((item) => item.id))

  // Delete automation items whose list item no longer exists
  const result = await prisma.aiAutomationItem.deleteMany({
    where: {
      automationId,
      listItemId: { notIn: Array.from(validListItemIds) },
    },
  })

  return { deleted: result.count }
}
