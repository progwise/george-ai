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

export function getFieldValue(
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      crawledByCrawler: { select: { uri: true } }
      library: { select: { name: true } }
    }
  }>,
  field: Prisma.AiListFieldGetPayload<{
    select: {
      sourceType: true
      fileProperty: true
      type: true
      cachedValues: {
        select: {
          fileId: true
          valueString: true
          valueNumber: true
          valueBoolean: true
          valueDate: true
          enrichmentErrorMessage: true
        }
      }
    }
  }>,
): { value: string | null; errorMessage: string | null } {
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
        value = file.crawledByCrawler?.uri || null
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

  const cache = field.cachedValues.find((cache) => cache.fileId === file.id) || null

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
