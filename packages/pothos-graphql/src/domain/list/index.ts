import type { Prisma } from '@george-ai/prismaClient'
import { DefaultArgs } from '@george-ai/prismaClient/runtime/library'

import { prisma } from '../../prisma'

export const LIST_FIELD_TYPES = ['string', 'text', 'number', 'date', 'datetime', 'boolean'] as const
export type FieldType = (typeof LIST_FIELD_TYPES)[number]

export const LIST_FIELD_SOURCE_TYPES = ['file_property', 'llm_computed'] as const
export type FieldSourceType = (typeof LIST_FIELD_SOURCE_TYPES)[number]

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
      cache: true
    }
  }>,
  field: Prisma.AiListFieldGetPayload<{
    select: {
      id: true
      name: true
      sourceType: true
      fileProperty: true
      type: true
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

  const caches = file.cache.filter((cache) => cache.fieldId === field.id)

  if (caches.length > 1) {
    throw new Error(`Multiple cached values found for field ${field.id} and file ${file.id}. Check your query.`)
  }

  const cache = caches.length === 1 ? caches[0] : null

  if (!cache) {
    return { value: '-', errorMessage: null }
  }
  if (field.sourceType !== 'llm_computed') {
    return { value: null, errorMessage: 'not an llm computed field' }
  }

  const errorMessage = cache.enrichmentErrorMessage || null
  switch (field.type) {
    case 'text':
    case 'string':
      return { value: cache.valueString, errorMessage }
    case 'number':
      return { value: cache.valueNumber?.toString() || null, errorMessage }
    case 'boolean':
      return { value: cache.valueBoolean !== null ? (cache.valueBoolean ? 'Yes' : 'No') : null, errorMessage }
    case 'date':
    case 'datetime':
      return { value: cache.valueDate?.toISOString() || null, errorMessage }
    default:
      return { value: null, errorMessage: 'unknown field type' }
  }
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
