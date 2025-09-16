import type { Prisma } from '@george-ai/prismaClient'
import PrismaClient from '@george-ai/prismaClient'

import { prisma } from '../../prisma'

const QueryMode = PrismaClient.Prisma.QueryMode

export const AiListFilterTypeValues = [
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'starts_with',
  'ends_with',
  'is_empty',
  'is_not_empty',
] as const
export type AiListFilterType = (typeof AiListFilterTypeValues)[number]

const getFieldPropertyFilterExpression = (filter: { filterType: AiListFilterType; value: string }) => {
  switch (filter.filterType) {
    case 'not_equals':
      return { not: filter.value }
    case 'contains':
      return { contains: filter.value, mode: QueryMode.insensitive }
    case 'not_contains':
      return { not: { contains: filter.value }, mode: QueryMode.insensitive }
    case 'starts_with':
      return { startsWith: filter.value, mode: QueryMode.insensitive }
    case 'ends_with':
      return { endsWith: filter.value, mode: QueryMode.insensitive }
    case 'is_not_empty':
      return { not: '' }
    case 'is_empty':
      return { equals: '' }
    case 'equals':
      return { equals: filter.value, mode: QueryMode.insensitive }
    default:
      throw new Error(`Unsupported filter type: ${filter.filterType}`)
  }
}

const getFilePropertyFilterWhere = (
  field: Prisma.AiListFieldGetPayload<object>,
  filter: { filterType: AiListFilterType; value: string },
): Prisma.AiLibraryFileWhereInput => {
  if (!field.fileProperty) {
    throw new Error(`Field is not a file property field: ${field.id}`)
  }

  switch (field.fileProperty) {
    case 'name':
    case 'originUri':
    case 'mimeType':
      return { [field.fileProperty]: getFieldPropertyFilterExpression(filter) }
    case 'source':
      return {
        library: {
          name: getFieldPropertyFilterExpression(filter),
        },
      }
    case 'crawlerUrl':
      return {
        crawledByCrawler: {
          uri: getFieldPropertyFilterExpression(filter),
        },
      }
    default:
      throw new Error(`Unsupported file property filter: ${field.fileProperty}`)
  }
}

const getFileCachePropertyFilterWhere = (
  field: Prisma.AiListFieldGetPayload<object>,
  filter: { filterType: AiListFilterType; value: string },
): Prisma.AiLibraryFileWhereInput => {
  return {
    cache: {
      some: {
        fieldId: field.id,
        valueString: getFieldPropertyFilterExpression(filter),
      },
    },
  }
}

export const getListFiltersWhere = async (
  filters: { fieldId: string; filterType: AiListFilterType; value: string }[],
) => {
  const fields = await prisma.aiListField.findMany({
    where: { id: { in: filters.map((f) => f.fieldId) } },
  })

  const fieldFilters: Array<Prisma.AiLibraryFileWhereInput> = []

  for (const filter of filters) {
    const field = fields.find((f) => f.id === filter.fieldId)
    if (!field) {
      throw new Error(`Field not found: ${filter.fieldId}`)
    }
    if (field?.sourceType !== 'llm_computed') {
      const fileFilterWhere = getFilePropertyFilterWhere(field, filter)
      fieldFilters.push(fileFilterWhere)
      continue
    }

    if (field.sourceType === 'llm_computed') {
      const fileCacheFilterWhere = getFileCachePropertyFilterWhere(field, filter)
      fieldFilters.push(fileCacheFilterWhere)
      continue
    }

    throw new Error(`Unsupported field source type for filtering: ${field.sourceType}`)
  }
  return fieldFilters.length > 0 ? { AND: fieldFilters } : {}
}
