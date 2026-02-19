import { prisma } from '@george-ai/app-database'

/**
 * Remove automation items that no longer have a corresponding list item.
 *
 * This is a safety net - CASCADE delete should handle this in most cases.
 */
export async function cleanupOrphanedItems(automationId: string): Promise<{ deleted: number }> {
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
