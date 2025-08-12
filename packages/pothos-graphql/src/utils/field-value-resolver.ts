import type { Prisma } from '@george-ai/prismaClient'

import { prisma } from '../prisma'

/**
 * Resolves the display value for a given field and file combination.
 * This utility handles both file property fields and computed fields with cached values.
 */
export async function getFieldValue(
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      crawledByCrawler: true
      cache: true
    }
  }>,
  field: Prisma.AiListFieldGetPayload<object>,
  cache?: Prisma.AiListItemCacheGetPayload<object> | null,
): Promise<string | null> {
  // Handle file property fields
  if (field.sourceType === 'file_property' && field.fileProperty) {
    switch (field.fileProperty) {
      case 'name':
        return file.name
      case 'originUri':
        return file.originUri
      case 'crawlerUrl': {
        // Check if we have the crawler data already loaded
        if (file.crawledByCrawler) {
          return file.crawledByCrawler.uri || null
        }
        // Fallback: query the crawler if we have the ID
        if (!file.crawledByCrawlerId) return null
        const crawler = await prisma.aiLibraryCrawler.findFirst({
          where: { id: file.crawledByCrawlerId },
        })
        return crawler?.uri || null
      }
      case 'processedAt':
        return file.processedAt?.toISOString() || null
      case 'originModificationDate':
        return file.originModificationDate?.toISOString() || null
      case 'size':
        return file.size?.toString() || null
      case 'mimeType':
        return file.mimeType
      default:
        return null
    }
  }

  // Handle computed fields - use cached value if available
  if (field.sourceType === 'llm_computed' && cache) {
    switch (field.type) {
      case 'string':
        return cache.valueString
      case 'number':
        return cache.valueNumber?.toString() || null
      case 'boolean':
        return cache.valueBoolean !== null ? (cache.valueBoolean ? 'Yes' : 'No') : null
      case 'date':
      case 'datetime':
        return cache.valueDate?.toISOString() || null
      default:
        return cache.valueString
    }
  }

  return null
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
  return file.cache?.find((cache) => cache.fieldId === fieldId) || null
}
