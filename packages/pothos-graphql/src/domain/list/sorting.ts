import type { Prisma } from '@george-ai/prismaClient'

export const getListSortingOrderBy = async (
  sorting: { fieldId: string; direction: 'asc' | 'desc' }[],
  fields: { id: string; name: string; sourceType: string; fileProperty: string | null; type: string }[],
) => {
  const orderBy: Prisma.Enumerable<Prisma.AiLibraryFileOrderByWithRelationInput> = []

  for (const sort of sorting) {
    const field = fields.find((f) => f.id === sort.fieldId)
    if (!field) {
      throw new Error(`Field not found: ${sort.fieldId}`)
    }
    if (field?.sourceType !== 'llm_computed') {
      if (!field.fileProperty) {
        throw new Error(`Field is not a file property field: ${field.id}`)
      }
      switch (field.fileProperty) {
        case 'name':
        case 'originUri':
        case 'mimeType':
          orderBy.push({ [field.fileProperty]: sort.direction })
          continue
        case 'source':
          orderBy.push({
            library: { name: sort.direction },
          })
          continue
        case 'crawlerUrl':
          orderBy.push({
            crawledByCrawler: { uri: sort.direction },
          })
          continue
        default:
          throw new Error(`Unsupported file property sorting: ${field.fileProperty}`)
      }
    }
    if (field.sourceType === 'llm_computed') {
      continue
    }

    throw new Error(`Unsupported field source type for sorting: ${field.sourceType}`)
  }

  // Always add a tiebreaker to ensure consistent ordering
  orderBy.push({ id: 'asc' })

  return orderBy
}
