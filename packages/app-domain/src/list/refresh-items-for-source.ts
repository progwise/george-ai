import { prisma } from '@george-ai/app-database'

import { syncItemsForList } from '../automation'
import { createItemsForSource } from './create-items-for-source'

/**
 * Refresh list items for a source (delete existing and recreate).
 * Uses a transaction to ensure atomicity - if creation fails, deletion is rolled back.
 */
export async function refreshItemsForSource(sourceId: string): Promise<{ created: number; deleted: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: { list: true },
  })

  if (!source.libraryId) {
    return { created: 0, deleted: 0 }
  }

  // Use transaction to ensure atomicity - if creation fails, deletion is rolled back
  const result = await prisma.$transaction(async (tx) => {
    // Delete existing items from database
    const deleted = await tx.aiListItem.deleteMany({
      where: { sourceId },
    })

    // Create new items within the same transaction
    const { created } = await createItemsForSource(sourceId)

    return { created, deleted: deleted.count }
  })

  // Sync automation items for the list (outside transaction - not critical for atomicity)
  await syncItemsForList(source.listId)

  return result
}
