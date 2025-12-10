/**
 * Automation item sync logic.
 *
 * Syncs list items to automation items, respecting filters.
 * Creates AiAutomationItem records for matching list items.
 */
import { prisma } from '../../prisma'

// PostgreSQL has a limit of 32,767 bind variables in prepared statements
// Use a safe batch size that accounts for complex queries with multiple binds per item
const BATCH_SIZE = 5000

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

  // Get existing automation items (batched for large lists)
  const existingItemIds = new Set<string>()
  let existingCursor: string | undefined
  do {
    const batch = await prisma.aiAutomationItem.findMany({
      take: BATCH_SIZE,
      ...(existingCursor ? { skip: 1, cursor: { id: existingCursor } } : {}),
      where: { automationId },
      select: { id: true, listItemId: true },
      orderBy: { id: 'asc' },
    })
    for (const item of batch) {
      existingItemIds.add(item.listItemId)
    }
    existingCursor = batch.length === BATCH_SIZE ? batch[batch.length - 1].id : undefined
  } while (existingCursor)

  // For now, all items are in scope (filter evaluation deferred to Phase 2)
  // TODO: Implement filter evaluation when filter format is defined
  const inScope = true

  // Fetch list items in batches and create automation items
  let syncedCount = 0
  let totalCount = 0
  let listItemCursor: string | undefined

  do {
    const batch = await prisma.aiListItem.findMany({
      take: BATCH_SIZE,
      ...(listItemCursor ? { skip: 1, cursor: { id: listItemCursor } } : {}),
      where: { listId: automation.listId },
      select: { id: true },
      orderBy: { id: 'asc' },
    })

    totalCount += batch.length

    // Filter to only new items not already in automation
    const newItemIds = batch.filter((item) => !existingItemIds.has(item.id)).map((item) => item.id)

    // Batch insert new automation items using createMany
    if (newItemIds.length > 0) {
      await prisma.aiAutomationItem.createMany({
        data: newItemIds.map((listItemId) => ({
          automationId,
          listItemId,
          inScope,
          status: 'PENDING' as const,
        })),
        skipDuplicates: true, // Safety net for race conditions
      })
      syncedCount += newItemIds.length
    }

    listItemCursor = batch.length === BATCH_SIZE ? batch[batch.length - 1].id : undefined
  } while (listItemCursor)

  const inScopeCount = inScope ? totalCount : 0

  return { synced: syncedCount, total: totalCount, inScope: inScopeCount }
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
