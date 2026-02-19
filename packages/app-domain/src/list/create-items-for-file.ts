import { prisma } from '@george-ai/app-database'
import { document, extraction as ex } from '@george-ai/file-management'

import { logger } from '../file/common'
import { TransactionClient } from './common'

export async function createItemsForFile({
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

  const file = await document.get(workspaceId, {
    libraryId,
    documentId: fileId,
  })

  if (!file) {
    logger.warn(`File not found when creating list items`, { workspaceId, libraryId, fileId })
    return 0
  }

  let itemsCreated = 0

  for (const extraction of file.extractions) {
    const extractionInfo = await ex.get(workspaceId, {
      libraryId,
      documentId: fileId,
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
