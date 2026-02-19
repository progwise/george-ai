import type { Prisma } from '@george-ai/app-database'

/**
 * Finds the cached value for a specific field and item combination
 */
export function findCacheValue(
  item: Prisma.AiListItemGetPayload<{
    include: {
      cache: true
    }
  }>,
  fieldId: string,
): Prisma.AiListItemCacheGetPayload<object> | null {
  return item.cache.find((cache) => cache.fieldId === fieldId) || null
}
