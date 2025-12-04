import { z } from 'zod'

import { Prisma } from '../../../prisma/generated/client'
import { LIST_FIELD_SOURCE_TYPES, LIST_FIELD_TYPES } from '../list'

export const EnrichmentStatusValues = ['pending', 'processing', 'completed', 'error', 'failed', 'canceled']

export type EnrichmentStatusType = (typeof EnrichmentStatusValues)[number]

export const ContextFieldSchema = z.object({
  contextType: z.enum(['fieldReference', 'vectorSearch', 'webFetch']),
  contextQuery: z.any().nullable().optional(),
  maxContentTokens: z.number().nullable().optional(),
  contextField: z
    .object({
      id: z.string(),
      name: z.string(),
      sourceType: z.enum(LIST_FIELD_SOURCE_TYPES),
      type: z.enum(LIST_FIELD_TYPES),
      fileProperty: z.string().nullable(),
      cachedValues: z.array(
        z.object({
          itemId: z.string(),
          valueString: z.string().nullable().optional(),
          valueNumber: z.number().nullable().optional(),
          valueBoolean: z.boolean().nullable().optional(),
          valueDate: z.date().nullable().optional(),
          valueDatetime: z.date().nullable().optional(),
          enrichmentErrorMessage: z.string().nullable().optional(),
        }),
      ),
    })
    .nullable()
    .optional(),
})

export const getFieldEnrichmentValidationSchema = () =>
  z.object({
    id: z.string(),
    name: z.string(),
    languageModelId: z.string(),
    languageProvider: z.string().nullable().optional(),
    languageModelName: z.string(),
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.enum(LIST_FIELD_TYPES),
    fileProperty: z.null(),
    sourceType: z.literal('llm_computed'),
    failureTerms: z.string().nullable(),
    listId: z.string(),
    context: z.array(ContextFieldSchema),
  })

export type ValidatedListField = z.infer<ReturnType<typeof getFieldEnrichmentValidationSchema>>

export const EnrichmentMetadataSchema = z.object({
  input: z
    .object({
      fileId: z.string(),
      fileName: z.string(),
      fieldId: z.string(),
      fieldName: z.string(),
      failureTerms: z.string().nullable().optional(),
      libraryId: z.string(),
      libraryName: z.string(),
      aiModelId: z.string(),
      aiModelProvider: z.string().nullable().optional(),
      aiModelName: z.string(),
      aiGenerationPrompt: z.string(),
      contextFields: z.array(
        z.object({
          fieldId: z.string(),
          fieldName: z.string(),
          value: z.string().nullable(),
          errorMessage: z.string().nullable(),
        }),
      ),
      contextVectorSearches: z
        .array(
          z.object({
            queryTemplate: z.string(),
            maxChunks: z.number().optional(),
            maxDistance: z.number().optional(),
            maxContentTokens: z.number().optional(),
          }),
        )
        .optional(),
      contextWebFetches: z
        .array(
          z.object({
            urlTemplate: z.string(),
            maxContentTokens: z.number().optional(),
          }),
        )
        .optional(),
      dataType: z.enum(LIST_FIELD_TYPES),
      libraryEmbeddingModel: z.string().optional(),
      libraryEmbeddingModelProvider: z.string().optional(),
    })
    .optional(),
  output: z
    .object({
      similarChunks: z
        .array(
          z.object({
            id: z.string(),
            fileName: z.string(),
            fileId: z.string(),
            text: z.string(),
            distance: z.number(),
          }),
        )
        .optional(),
      messages: z.array(
        z.object({
          role: z.string(),
          content: z.string(),
        }),
      ),
      aiInstance: z.string().optional(),
      enrichedValue: z.string().optional(),
      issues: z.array(z.string()),
    })
    .optional(),
})

export type EnrichmentMetadata = z.infer<typeof EnrichmentMetadataSchema>

export const getEnrichmentTaskInputMetadata = ({
  validatedField,
  item,
}: {
  validatedField: ValidatedListField
  item: Prisma.AiListItemGetPayload<{
    include: {
      sourceFile: {
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
            value = item.sourceFile.name
            break
          case 'originUri':
            value = item.sourceFile.originUri ?? null
            break
          case 'source':
            value = item.sourceFile.library.name
            break
          case 'crawlerUri':
            value = item.sourceFile.crawledByCrawler?.uri ?? null
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
      const query = ctx.contextQuery as { queryTemplate?: string; maxChunks?: number; maxDistance?: number }
      return {
        queryTemplate: query.queryTemplate || '',
        maxChunks: query.maxChunks || undefined,
        maxDistance: query.maxDistance || undefined,
        maxContentTokens: ctx.maxContentTokens || undefined,
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

  return {
    aiModelId: validatedField.languageModelId,
    aiModelProvider: validatedField.languageProvider,
    aiModelName: validatedField.languageModelName,
    aiGenerationPrompt: validatedField.prompt,
    contextFields,
    contextVectorSearches: contextVectorSearches.length > 0 ? contextVectorSearches : undefined,
    contextWebFetches: contextWebFetches.length > 0 ? contextWebFetches : undefined,
    dataType: validatedField.type,
    libraryEmbeddingModel: item.sourceFile.library.embeddingModel?.name || undefined,
    libraryEmbeddingModelProvider: item.sourceFile.library.embeddingModel?.provider || undefined,
    fileId: item.sourceFile.id,
    fileName: item.sourceFile.name,
    fieldId: validatedField.id,
    fieldName: validatedField.name,
    failureTerms: validatedField.failureTerms,
    libraryId: item.sourceFile.library.id,
    libraryName: item.sourceFile.library.name,
  }
}

export const validateEnrichmentTaskForProcessing = (enrichmentTask: Prisma.AiEnrichmentTaskGetPayload<object>) => {
  const metadata = JSON.parse(enrichmentTask.metadata || '{}')
  const parsed = EnrichmentMetadataSchema.safeParse(metadata)
  return parsed
}

/**
 * Substitutes {{fieldName}} placeholders in a template string with actual field values
 * @param template - Template string with {{fieldName}} placeholders
 * @param contextFields - Array of context fields with their values
 * @returns Substituted string, or null if any required field is missing
 */
export function substituteTemplate(
  template: string,
  contextFields: Array<{ fieldName: string; value: string | null }>,
): string | null {
  let result = template
  const fieldMap = new Map(contextFields.map((f) => [f.fieldName.toLowerCase(), f.value]))

  // Find all {{fieldName}} placeholders
  const placeholderRegex = /\{\{([^}]+)\}\}/g
  const matches = [...template.matchAll(placeholderRegex)]

  for (const match of matches) {
    const fieldName = match[1].trim()
    const value = fieldMap.get(fieldName.toLowerCase())

    // If any required field is null/missing, return null
    if (value === null || value === undefined) {
      console.warn(`⚠️ Template substitution failed: field "${fieldName}" has no value`)
      return null
    }

    result = result.replace(match[0], value)
  }

  return result
}
