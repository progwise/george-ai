import type { Prisma } from '../../../prisma/generated/client'
import { prisma } from '../../prisma'

export * from './filter'

export const LIST_FIELD_TYPES = ['string', 'text', 'markdown', 'number', 'date', 'datetime', 'boolean'] as const
export type FieldType = (typeof LIST_FIELD_TYPES)[number]

export const LIST_FIELD_SOURCE_TYPES = ['file_property', 'llm_computed'] as const
export type FieldSourceType = (typeof LIST_FIELD_SOURCE_TYPES)[number]

export const LIST_FIELD_FILE_PROPERTIES = [
  'name',
  'originUri',
  'crawlerUrl',
  'originModificationDate',
  'size',
  'mimeType',
  'source',
  'processedAt',
  'lastUpdate',
] as const
export type FieldFileProperty = (typeof LIST_FIELD_FILE_PROPERTIES)[number]

export const LIST_FIELD_CONTEXT_TYPES = ['fieldReference', 'vectorSearch', 'webFetch'] as const
export type FieldContextType = (typeof LIST_FIELD_CONTEXT_TYPES)[number]

/**
 * Check if user can access a list.
 * Access is granted if the user is a member of the workspace that owns the list.
 */
export const canAccessListOrThrow = async (
  listId: string,
  userId: string,
  options?: { include: Prisma.AiListInclude },
) => {
  const list = await prisma.aiList.findUniqueOrThrow({
    include: options?.include || {},
    where: { id: listId },
  })

  // Check if user is a member of the list's workspace
  const isMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId: list.workspaceId,
      userId,
    },
  })

  if (!isMember) {
    throw new Error(`You do not have permission to access this list`)
  }

  return list
}

/**
 * Check if user is the owner of a list (for delete operations).
 */
export const isListOwnerOrThrow = async (listId: string, userId: string) => {
  const list = await prisma.aiList.findUniqueOrThrow({
    where: { id: listId },
    select: {
      ownerId: true,
    },
  })

  if (list.ownerId !== userId) {
    throw new Error(`Only the owner can delete this list`)
  }

  return list
}

export const getCanAccessListWhere = (workspaceId: string): Prisma.AiListWhereInput => ({
  workspaceId,
})

export function getFieldValue(
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      contentExtractionTasks: { select: { processingFinishedAt: true } }
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
): { value: string | null; errorMessage: string | null; failedEnrichmentValue: string | null } {
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
      case 'processedAt':
        value = file.contentExtractionTasks?.[0]?.processingFinishedAt?.toISOString() || null
        break
      case 'lastUpdate':
        value = file.updatedAt.toISOString()
        break
      default:
        value = null
    }
    return { value, errorMessage: null, failedEnrichmentValue: null }
  }

  const caches = file.cache.filter((cache) => cache.fieldId === field.id)

  if (caches.length > 1) {
    throw new Error(`Multiple cached values found for field ${field.id} and file ${file.id}. Check your query.`)
  }

  const cache = caches.length === 1 ? caches[0] : null

  if (!cache) {
    return { value: '-', errorMessage: null, failedEnrichmentValue: null }
  }
  if (field.sourceType !== 'llm_computed') {
    return { value: null, errorMessage: 'not an llm computed field', failedEnrichmentValue: null }
  }

  const errorMessage = cache.enrichmentErrorMessage || null
  const failedEnrichmentValue = cache.failedEnrichmentValue || null

  switch (field.type) {
    case 'markdown':
    case 'text':
    case 'string':
      return { value: cache.valueString, errorMessage, failedEnrichmentValue }
    case 'number':
      return { value: cache.valueNumber?.toString() || null, errorMessage, failedEnrichmentValue }
    case 'boolean':
      return {
        value: cache.valueBoolean !== null ? (cache.valueBoolean ? 'Yes' : 'No') : null,
        errorMessage,
        failedEnrichmentValue,
      }
    case 'date':
    case 'datetime':
      return { value: cache.valueDate?.toISOString() || null, errorMessage, failedEnrichmentValue }
    default:
      return { value: null, errorMessage: 'unknown field type', failedEnrichmentValue: null }
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
