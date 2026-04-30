import { Prisma } from '@george-ai/app-database'

import { EnrichmentMetadata, ValidatedField } from './schema'

export const getEnrichmentTaskInputMetadata = ({
  validatedField,
  item,
}: {
  validatedField: ValidatedField
  item: Prisma.AiListItemGetPayload<{
    include: {
      file: {
        include: {
          crawledByCrawler: { select: { id: true; uri: true } }
          library: { select: { id: true; name: true; embeddingModel: { select: { provider: true; name: true } } } }
          contentExtractionTasks: { select: { processingFinishedAt: true } }
        }
      }
    }
  }>
}): EnrichmentMetadata['input'] => {
  // Process field reference context sources
  const contextFields = validatedField.context
    .filter((ctx) => ctx.contextField !== null && ctx.contextField !== undefined)
    .map((contextField) => {
      // TypeScript needs the assertion because filter doesn't narrow the type
      const field = contextField.contextField!

      // Find the cached value for this specific item
      const cachedValue = field.cachedValues?.find((cv) => cv.itemId === item.id)

      let value: string | null = null
      let errorMessage: string | null = cachedValue?.enrichmentErrorMessage ?? null

      if (field.sourceType === 'file_property') {
        // Get value from file property
        switch (field.fileProperty) {
          case 'name':
            value = item.file.name
            break
          case 'originUri':
            value = item.file.originUri ?? null
            break
          case 'source':
            value = item.file.library.name
            break
          case 'crawlerUri':
            value = item.file.crawledByCrawler?.uri ?? null
            break
          default:
            errorMessage = `Unknown file property: ${field.fileProperty}`
        }
      } else if (cachedValue) {
        // Get value from cached value based on field type
        switch (field.type) {
          case 'string':
          case 'text':
          case 'markdown':
            value = cachedValue.valueString ?? null
            break
          case 'number':
            value = cachedValue.valueNumber?.toString() ?? null
            break
          case 'boolean':
            value = cachedValue.valueBoolean === null ? null : cachedValue.valueBoolean ? 'Yes' : 'No'
            break
          case 'date':
          case 'datetime':
            value = cachedValue.valueDate?.toISOString() ?? cachedValue.valueDatetime?.toISOString() ?? null
            break
          default:
            errorMessage = `Unknown field type: ${field.type}`
        }
      }

      return {
        fieldId: field.id,
        fieldName: field.name,
        value,
        errorMessage,
      }
    })

  // Process vector search context sources
  const contextVectorSearches = validatedField.context
    .filter((ctx) => ctx.contextType === 'vectorSearch' && ctx.contextQuery)
    .map((ctx) => {
      const query = ctx.contextQuery as {
        queryTemplate?: string
        maxChunks?: number
        maxDistance?: number
        scope?: 'library' | 'file' | 'file-part'
      }
      return {
        queryTemplate: query.queryTemplate || '',
        maxChunks: query.maxChunks || undefined,
        maxDistance: query.maxDistance || undefined,
        maxContentTokens: ctx.maxContentTokens || undefined,
        scope: query.scope || 'file-part',
      }
    })

  // Process web fetch context sources
  const contextWebFetches = validatedField.context
    .filter((ctx) => ctx.contextType === 'webFetch' && ctx.contextQuery)
    .map((ctx) => {
      const query = ctx.contextQuery as { urlTemplate?: string }
      return {
        urlTemplate: query.urlTemplate || '',
        maxContentTokens: ctx.maxContentTokens || undefined,
      }
    })

  // Process full content context sources
  const contextFullContent = validatedField.context.find((ctx) => ctx.contextType === 'fullContent')

  return {
    aiModelId: validatedField.languageModelId,
    aiModelProvider: validatedField.languageProvider,
    aiModelName: validatedField.languageModelName,
    aiGenerationPrompt: validatedField.prompt,
    contextFields,
    contextVectorSearches: contextVectorSearches.length > 0 ? contextVectorSearches : undefined,
    contextWebFetches: contextWebFetches.length > 0 ? contextWebFetches : undefined,
    contextFullContent: contextFullContent
      ? { maxContentTokens: contextFullContent.maxContentTokens || 3000 }
      : undefined,
    dataType: validatedField.type,
    libraryEmbeddingModel: item.file.library.embeddingModel?.name || undefined,
    libraryEmbeddingModelProvider: item.file.library.embeddingModel?.provider || undefined,
    fileId: item.file.id,
    fileName: item.file.name,
    fragment: item.fragment,
    fieldId: validatedField.id,
    fieldName: validatedField.name,
    failureTerms: validatedField.failureTerms,
    libraryId: item.file.library.id,
    libraryName: item.file.library.name,
    extractionMethod: item.extractionMethod,
    fragmentHash: item.fragmentHash,
  }
}
