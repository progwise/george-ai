import type { Prisma } from '@george-ai/prismaClient'
import { DefaultArgs } from '@george-ai/prismaClient/runtime/library'

import { prisma } from '../../prisma'

export const canAccessListOrThrow = async (
  listId: string,
  userId: string,
  options?: { include: Prisma.AiListInclude<DefaultArgs> },
) => {
  const list = await prisma.aiList.findFirstOrThrow({
    include: { participants: true, ...(options?.include || {}) },
    where: { AND: [{ id: listId }, getCanAccessListWhere(userId)] },
  })
  return list
}

export const getCanAccessListWhere = (userId: string): Prisma.AiListWhereInput => ({
  OR: [{ ownerId: userId }, { participants: { some: { userId } } }],
})

/**
 * Resolves the display value for a given field and file combination.
 * This utility handles both file property fields and computed fields with cached values.
 * Returns both the value and any enrichment error message.
 */
export async function getFieldValue(
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      crawledByCrawler: true
      cache: true
      library: true
    }
  }>,
  field: Prisma.AiListFieldGetPayload<object>,
): Promise<{ value: string | null; errorMessage: string | null }> {
  // Handle file property fields - these don't have enrichment errors
  if (field.sourceType === 'file_property' && field.fileProperty) {
    let value: string | null = null
    switch (field.fileProperty) {
      case 'name':
        value = file.name
        break
      case 'originUri':
        value = file.originUri
        break
      case 'crawlerUrl': {
        // Check if we have the crawler data already loaded
        if (file.crawledByCrawler) {
          value = file.crawledByCrawler.uri || null
        } else if (file.crawledByCrawlerId) {
          // Fallback: query the crawler if we have the ID
          const crawler = await prisma.aiLibraryCrawler.findFirst({
            where: { id: file.crawledByCrawlerId },
          })
          value = crawler?.uri || null
        }
        break
      }
      case 'originModificationDate':
        value = file.originModificationDate?.toISOString() || null
        break
      case 'size':
        value = file.size?.toString() || null
        break
      case 'mimeType':
        value = file.mimeType
        break
      case 'source':
        value = file.library.name
        break
      default:
        value = null
    }
    return { value, errorMessage: null }
  }

  const cache = findCacheValue(file, field.id)

  // Handle computed fields - use cached value if available
  if (field.sourceType === 'llm_computed' && cache) {
    let value: string | null = null
    switch (field.type) {
      case 'string':
        value = cache.valueString
        break
      case 'number':
        value = cache.valueNumber?.toString() || null
        break
      case 'boolean':
        value = cache.valueBoolean !== null ? (cache.valueBoolean ? 'Yes' : 'No') : null
        break
      case 'date':
      case 'datetime':
        value = cache.valueDate?.toISOString() || null
        break
      default:
        value = cache.valueString
    }
    return { value, errorMessage: cache.enrichmentErrorMessage || null }
  }

  return { value: null, errorMessage: null }
}

/**
 * Finds the cached value for a specific field and file combination
 */
export function findCacheValue(
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      cache: true
    }
  }>,
  fieldId: string,
): Prisma.AiListItemCacheGetPayload<object> | null {
  return file.cache.find((cache) => cache.fieldId === fieldId) || null
}
