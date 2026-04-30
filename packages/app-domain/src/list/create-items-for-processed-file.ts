import { prisma } from '@george-ai/app-database'

import { syncItemsForList } from '../automation'
import { createItemsForFile } from './create-items-for-file'

/**
 * Create list items for a file across all list sources that link to its library.
 * Called after file processing (markdown extraction) completes.
 */
export async function createItemsForProcessedFile(
  fileId: string,
  libraryId: string,
): Promise<{ created: number; sources: number }> {
  // Get file info
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
    select: { name: true },
  })

  if (!file) {
    return { created: 0, sources: 0 }
  }

  // Find all list sources that link to this library
  const sources = await prisma.aiListSource.findMany({
    where: { libraryId },
    include: { list: true },
  })

  if (sources.length === 0) {
    return { created: 0, sources: 0 }
  }

  let totalCreated = 0
  const processedListIds = new Set<string>()

  for (const source of sources) {
    const created = await createItemsForFile({
      workspaceId: source.list.workspaceId,
      sourceId: source.id,
      fileId,
      fileName: file.name,
      listId: source.listId,
      libraryId,
    })
    totalCreated += created
    processedListIds.add(source.listId)
  }

  // Sync automation items once per unique list (avoid redundant calls)
  for (const listId of Array.from(processedListIds)) {
    await syncItemsForList(listId)
  }

  return { created: totalCreated, sources: sources.length }
}
