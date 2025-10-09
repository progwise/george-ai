import { z } from 'zod'

import { Prisma } from '../../../prisma/generated/client'
import { LIST_FIELD_SOURCE_TYPES, LIST_FIELD_TYPES, getFieldValue } from '../list'

export const EnrichmentStatusValues = ['pending', 'processing', 'completed', 'error', 'failed', 'canceled']

export type EnrichmentStatusType = (typeof EnrichmentStatusValues)[number]

export const ContextFieldSchema = z.object({
  contextField: z.object({
    id: z.string(),
    name: z.string(),
    sourceType: z.enum(LIST_FIELD_SOURCE_TYPES),
    type: z.enum(LIST_FIELD_TYPES),
    fileProperty: z.string().nullable(),
    cachedValues: z.array(
      z.object({
        fileId: z.string(),
        valueString: z.string().nullable(),
        valueNumber: z.number().nullable(),
        valueBoolean: z.boolean().nullable(),
        valueDate: z.date().nullable(),
        valueDatetime: z.date().nullable(),
        enrichmentErrorMessage: z.string().nullable(),
      }),
    ),
  }),
})

export const getFieldEnrichmentValidationSchema = ({ useVectorStore }: { useVectorStore?: boolean | null }) =>
  z.object({
    id: z.string(),
    name: z.string(),
    languageModel: z.string(),
    prompt: z.string().min(1, 'Prompt is required'),
    type: z.enum(LIST_FIELD_TYPES),
    fileProperty: z.null(),
    sourceType: z.literal('llm_computed'),
    contentQuery: useVectorStore
      ? z.string().min(1, 'Content query is required when using vector store')
      : z.string().nullable().optional(),
    useVectorStore: z.boolean(),
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
      aiModel: z.string(),
      aiGenerationPrompt: z.string(),
      contextFields: z.array(
        z.object({
          fieldId: z.string(),
          fieldName: z.string(),
          value: z.string().nullable(),
          errorMessage: z.string().nullable(),
        }),
      ),
      dataType: z.enum(LIST_FIELD_TYPES),
      libraryEmbeddingModel: z.string().optional(),
      contentQuery: z.string().optional(),
      useVectorStore: z.boolean(),
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
  file,
}: {
  validatedField: ValidatedListField
  file: Prisma.AiLibraryFileGetPayload<{
    include: {
      crawledByCrawler: { select: { id: true; uri: true } }
      library: { select: { id: true; name: true; embeddingModelName: true } }
      cache: true
      contentExtractionTasks: { select: { processingFinishedAt: true } }
    }
  }>
}): EnrichmentMetadata['input'] => {
  const contextFields = validatedField.context.map((contextField) => {
    const { value, errorMessage } = getFieldValue(file, contextField.contextField)
    return {
      fieldId: contextField.contextField.id,
      fieldName: contextField.contextField.name,
      value,
      errorMessage,
    }
  })
  return {
    aiModel: validatedField.languageModel,
    aiGenerationPrompt: validatedField.prompt,
    contextFields,
    dataType: validatedField.type,
    libraryEmbeddingModel: file.library.embeddingModelName || undefined,
    contentQuery: validatedField.useVectorStore ? validatedField.contentQuery || undefined : undefined,
    useVectorStore: !!validatedField.useVectorStore,
    fileId: file.id,
    fileName: file.name,
    fieldId: validatedField.id,
    fieldName: validatedField.name,
    failureTerms: validatedField.failureTerms,
    libraryId: file.library.id,
    libraryName: file.library.name,
  }
}

export const validateEnrichmentTaskForProcessing = (enrichmentTask: Prisma.AiEnrichmentTaskGetPayload<object>) => {
  const metadata = JSON.parse(enrichmentTask.metadata || '{}')
  const parsed = EnrichmentMetadataSchema.safeParse(metadata)
  return parsed
}
