import { prisma } from '@george-ai/app-database'

import { createItemsForFile } from './create-items-for-file'

/**
 * Create list items for all files in a list source.
 */
export async function createItemsForSource(sourceId: string): Promise<{ created: number; files: number }> {
  const source = await prisma.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: { list: true },
  })

  if (!source.libraryId) {
    return { created: 0, files: 0 }
  }

  const files = await prisma.aiLibraryFile.findMany({
    where: {
      libraryId: source.libraryId,
      archivedAt: null,
    },
    select: { id: true, name: true },
  })

  let totalCreated = 0

  for (const file of files) {
    const created = await createItemsForFile({
      workspaceId: source.list.workspaceId,
      sourceId,
      fileId: file.id,
      fileName: file.name,
      listId: source.listId,
      libraryId: source.libraryId,
    })
    totalCreated += created
  }

  return { created: totalCreated, files: files.length }
}
