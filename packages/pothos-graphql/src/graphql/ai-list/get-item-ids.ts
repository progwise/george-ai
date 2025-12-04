import { AiListFilterType, FieldFileProperty, FieldSourceType, FieldType } from '../../domain/list'
import { prisma } from '../../prisma'

const getValueFieldName = (fieldType: FieldType) => {
  switch (fieldType) {
    case 'string':
    case 'text':
    case 'markdown':
      return 'valueString'
    case 'number':
      return 'valueNumber'
    case 'date':
    case 'datetime':
      return 'valueDate'
    case 'boolean':
      return 'valueBoolean'
    default:
      throw new Error(`Unsupported field type for value extraction: ${fieldType}`)
  }
}

interface GetItemIdsForListOptions {
  listId: string
  fields: { id: string; type: FieldType; sourceType: FieldSourceType; fileProperty: FieldFileProperty | null }[]
  sorting: { fieldId: string; direction: 'asc' | 'desc' }[]
  filters: { fieldId: string; filterType: AiListFilterType; value: string }[]
  showArchived: boolean
  skip: number
  take: number
}

/**
 * Build filter condition for a field with proper parameterization
 */
const buildFilterCondition = (
  field: { type: FieldType },
  filterType: AiListFilterType,
  filterValue: string,
  columnRef: string,
  params: (string | number | boolean | Date | null)[],
): string => {
  const addParam = (value: string | number | boolean | Date | null): string => {
    params.push(value)
    return `$${params.length}`
  }

  switch (field.type) {
    case 'string':
    case 'text':
    case 'markdown':
      switch (filterType) {
        case 'equals':
          return `${columnRef} = ${addParam(filterValue)}`
        case 'not_equals':
          return `${columnRef} != ${addParam(filterValue)}`
        case 'contains':
          return `${columnRef} ILIKE ${addParam(`%${filterValue}%`)}`
        case 'not_contains':
          return `${columnRef} NOT ILIKE ${addParam(`%${filterValue}%`)}`
        case 'starts_with':
          return `${columnRef} ILIKE ${addParam(`${filterValue}%`)}`
        case 'ends_with':
          return `${columnRef} ILIKE ${addParam(`%${filterValue}`)}`
        case 'is_empty':
          return `(${columnRef} = '' OR ${columnRef} IS NULL)`
        case 'is_not_empty':
          return `(${columnRef} != '' AND ${columnRef} IS NOT NULL)`
        default:
          throw new Error(`Unsupported filter type for string field: ${filterType}`)
      }

    case 'number': {
      const numberValue = Number(filterValue)
      if (isNaN(numberValue)) {
        throw new Error(`Invalid number value for filter: ${filterValue}`)
      }
      switch (filterType) {
        case 'equals':
          return `${columnRef} = ${addParam(numberValue)}`
        case 'not_equals':
          return `${columnRef} != ${addParam(numberValue)}`
        case 'is_empty':
          return `${columnRef} IS NULL`
        case 'is_not_empty':
          return `${columnRef} IS NOT NULL`
        default:
          throw new Error(`Unsupported filter type for number field: ${filterType}`)
      }
    }

    case 'date':
    case 'datetime': {
      const dateValue = new Date(filterValue)
      if (isNaN(dateValue.getTime())) {
        throw new Error(`Invalid date value for filter: ${filterValue}`)
      }
      switch (filterType) {
        case 'equals':
          return `${columnRef} = ${addParam(dateValue.toISOString())}`
        case 'not_equals':
          return `${columnRef} != ${addParam(dateValue.toISOString())}`
        case 'is_empty':
          return `${columnRef} IS NULL`
        case 'is_not_empty':
          return `${columnRef} IS NOT NULL`
        default:
          throw new Error(`Unsupported filter type for date field: ${filterType}`)
      }
    }

    case 'boolean': {
      const boolValue = filterValue.toLowerCase()
      if (boolValue !== 'true' && boolValue !== 'false') {
        throw new Error(`Invalid boolean value for filter: ${filterValue}`)
      }
      const booleanParam = boolValue === 'true'
      switch (filterType) {
        case 'equals':
          return `${columnRef} = ${addParam(booleanParam)}`
        case 'not_equals':
          return `${columnRef} != ${addParam(booleanParam)}`
        case 'is_empty':
          return `${columnRef} IS NULL`
        case 'is_not_empty':
          return `${columnRef} IS NOT NULL`
        default:
          throw new Error(`Unsupported filter type for boolean field: ${filterType}`)
      }
    }

    default:
      throw new Error(`Unsupported field type for filtering: ${field.type}`)
  }
}

/**
 * Get the proper column reference for a file property (accessed via sourceFile)
 */
const getFilePropertyColumn = (fileProperty: FieldFileProperty): { table: string; column: string } => {
  switch (fileProperty) {
    case 'itemName':
      return { table: 'AiListItem', column: 'itemName' }
    case 'name':
      return { table: 'AiLibraryFile', column: 'name' }
    case 'originUri':
      return { table: 'AiLibraryFile', column: 'originUri' }
    case 'mimeType':
      return { table: 'AiLibraryFile', column: 'mimeType' }
    case 'size':
      return { table: 'AiLibraryFile', column: 'size' }
    case 'originModificationDate':
      return { table: 'AiLibraryFile', column: 'originModificationDate' }
    case 'extractedAt':
      return { table: 'AiContentProcessingTask', column: 'extractionFinishedAt' }
    case 'source':
      return { table: 'AiLibrary', column: 'name' }
    case 'crawlerUrl':
      return { table: 'AiLibraryCrawler', column: 'uri' }
    case 'lastUpdate':
      return { table: 'AiLibraryFile', column: 'updatedAt' }
    default:
      throw new Error(`Unsupported file property: ${fileProperty}`)
  }
}

/**
 * Get item IDs for list items with sorting and filtering
 * Now queries AiListItem table instead of directly querying AiLibraryFile
 */
export const getItemIdsForListItems = async ({
  listId,
  fields,
  sorting,
  filters,
  showArchived,
  skip,
  take,
}: GetItemIdsForListOptions) => {
  const params: (string | number | boolean | Date | null)[] = []
  const sqlParts: string[] = []

  // Build base query - start from AiListItem and join to files
  sqlParts.push(`
    SELECT "AiListItem"."id" AS "itemId"
    FROM "AiListItem"
    INNER JOIN "AiLibraryFile" ON "AiListItem"."sourceFileId" = "AiLibraryFile"."id"
    LEFT JOIN "AiLibrary" ON "AiLibraryFile"."libraryId" = "AiLibrary"."id"
    LEFT JOIN "AiLibraryCrawler" ON "AiLibraryFile"."crawledByCrawlerId" = "AiLibraryCrawler"."id"
    LEFT JOIN "AiContentProcessingTask" ON "AiLibraryFile"."id" = "AiContentProcessingTask"."fileId"
      AND "AiContentProcessingTask"."extractionFinishedAt" = (SELECT MAX("extractionFinishedAt") FROM "AiContentProcessingTask" AS "cet" WHERE "cet"."fileId" = "AiLibraryFile"."id")
  `)

  // Track cache table aliases for computed fields
  const cacheAliases = new Map<string, string>()
  const computedFields = fields.filter((f) => f.sourceType === 'llm_computed')

  // Add joins for computed fields - now join on itemId instead of fileId
  computedFields.forEach((field) => {
    const alias = `cache_${cacheAliases.size + 1}`
    cacheAliases.set(field.id, alias)

    params.push(field.id)
    sqlParts.push(`
    LEFT JOIN "AiListItemCache" AS "${alias}"
      ON "${alias}"."itemId" = "AiListItem"."id"
      AND "${alias}"."fieldId" = $${params.length}
    `)
  })

  // Build WHERE clause
  const whereConditions: string[] = []

  // Add list filter
  params.push(listId)
  whereConditions.push(`"AiListItem"."listId" = $${params.length}`)

  // Add archive filter (on the source file)
  if (!showArchived) {
    whereConditions.push(`"AiLibraryFile"."archivedAt" IS NULL`)
  }

  // Add field filters
  filters.forEach((filter) => {
    const field = fields.find((f) => f.id === filter.fieldId)
    if (!field) return

    if (field.sourceType === 'llm_computed') {
      const alias = cacheAliases.get(field.id)
      if (!alias) return

      const valueField = getValueFieldName(field.type)
      const columnRef = `"${alias}"."${valueField}"`
      const condition = buildFilterCondition(field, filter.filterType, filter.value, columnRef, params)
      whereConditions.push(condition)
    } else if (field.sourceType === 'file_property' && field.fileProperty) {
      const { table, column } = getFilePropertyColumn(field.fileProperty)
      const columnRef = `"${table}"."${column}"`
      const condition = buildFilterCondition(field, filter.filterType, filter.value, columnRef, params)
      whereConditions.push(condition)
    }
  })

  if (whereConditions.length > 0) {
    sqlParts.push(`
    WHERE ${whereConditions.join(' AND ')}`)
  }

  // Build ORDER BY clause
  const orderByParts: string[] = []

  sorting.forEach((sort) => {
    const field = fields.find((f) => f.id === sort.fieldId)
    if (!field) return

    const direction = sort.direction.toUpperCase()
    if (direction !== 'ASC' && direction !== 'DESC') return

    if (field.sourceType === 'llm_computed') {
      const alias = cacheAliases.get(field.id)
      if (!alias) return

      const valueField = getValueFieldName(field.type)
      orderByParts.push(`"${alias}"."${valueField}" ${direction}`)
    } else if (field.sourceType === 'file_property' && field.fileProperty) {
      const { table, column } = getFilePropertyColumn(field.fileProperty)
      orderByParts.push(`"${table}"."${column}" ${direction}`)
    }
  })

  // Always add ID for stable sorting
  orderByParts.push(`"AiListItem"."id" ASC`)

  if (orderByParts.length > 0) {
    sqlParts.push(`
    ORDER BY ${orderByParts.join(', ')}`)
  }

  // Add pagination
  params.push(skip)
  sqlParts.push(`
    OFFSET $${params.length}`)

  params.push(take)
  sqlParts.push(`
    LIMIT $${params.length}
  `)

  // Execute query
  const sql = sqlParts.join('')
  const result = await prisma.$queryRawUnsafe<{ itemId: string }[]>(sql, ...params)

  return result.map((r) => r.itemId)
}
