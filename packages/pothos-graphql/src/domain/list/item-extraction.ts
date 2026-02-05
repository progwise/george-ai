import { prisma } from '@george-ai/app-database'
import { workspaceStorage } from '@george-ai/file-management'

import { syncAutomationItemsForList } from '../automation'
import { logger } from '../file/common'

type PrismaClient = typeof prisma
type TransactionClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

async function createListItemsForFile({
  workspaceId,
  sourceId,
  fileId,
  fileName,
  listId,
  libraryId,
  tx = prisma,
}: {
  workspaceId: string
  sourceId: string
  fileId: string
  fileName: string
  listId: string
  libraryId: string
  tx?: TransactionClient
}): Promise<number> {
  // Check if items already exist for this file/source combination
  const existingItemCount = await tx.aiListItem.count({
    where: { sourceId, fileId },
  })

  // Skip if items already exist
  if (existingItemCount > 0) {
    return 0
  }

  const file = await workspaceStorage.getFile(workspaceId, {
    libraryId,
    fileId,
  })

  if (!file) {
    logger.warn(`File not found when creating list items`, { workspaceId, libraryId, fileId })
    return 0
  }

  let itemsCreated = 0

  for (const extraction of file.extractions) {
    const extractionInfo = await workspaceStorage.getExtraction(workspaceId, {
      libraryId,
      fileId,
      extractionMethod: extraction.extractionMethod,
    })

    const fragmentCount = extractionInfo?.fragmentCount

    if (!fragmentCount) {
      // Single item for this extraction
      const result = await tx.aiListItem.createMany({
        data: [
          {
            listId,
            sourceId,
            fileId,
            itemName: `${fileName}_${extraction.extractionMethod}`,
          },
        ],
        skipDuplicates: true,
      })
      itemsCreated += result.count
    } else {
      // Multiple fragments - use batch insert
      const result = await tx.aiListItem.createMany({
        data: Array.from({ length: fragmentCount }, (_, index) => ({
          listId,
          sourceId,
          fileId,
          fragmentCount: index + 1,
          itemName: `${fileName} - Fragment ${index + 1}`,
        })),
        skipDuplicates: true,
      })
      itemsCreated += result.count
    }
  }
  return itemsCreated
}

/**
 * Create list items for all files in a list source.
 */
export async function createListItemsForSource(
  sourceId: string,
  tx: TransactionClient = prisma,
): Promise<{ created: number; files: number }> {
  const source = await tx.aiListSource.findUniqueOrThrow({
    where: { id: sourceId },
    include: { list: true },
  })

  if (!source.libraryId) {
    return { created: 0, files: 0 }
  }

  const files = await tx.aiLibraryFile.findMany({
    where: {
      libraryId: source.libraryId,
      archivedAt: null,
    },
    select: { id: true, name: true },
  })

  let totalCreated = 0

  for (const file of files) {
    const created = await createListItemsForFile({
      workspaceId: source.list.workspaceId,
      sourceId,
      fileId: file.id,
      fileName: file.name,
      listId: source.listId,
      libraryId: source.libraryId,
      tx,
    })
    totalCreated += created
  }

  return { created: totalCreated, files: files.length }
}

/**
 * Refresh list items for a source (delete existing and recreate).
 * Uses a transaction to ensure atomicity - if creation fails, deletion is rolled back.
 */
export async function refreshListItemsForSource(sourceId: string): Promise<{ created: number; deleted: number }> {
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
    const { created } = await createListItemsForSource(sourceId, tx)

    return { created, deleted: deleted.count }
  })

  // Sync automation items for the list (outside transaction - not critical for atomicity)
  await syncAutomationItemsForList(source.listId)

  return result
}

/**
 * Create list items for a file across all list sources that link to its library.
 * Called after file processing (markdown extraction) completes.
 */
export async function createListItemsForProcessedFile(
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
    const created = await createListItemsForFile({
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
    await syncAutomationItemsForList(listId)
  }

  return { created: totalCreated, sources: sources.length }
}
