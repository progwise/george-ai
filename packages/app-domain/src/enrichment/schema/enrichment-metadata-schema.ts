import { z } from 'zod'

import { LIST_FIELD_TYPES } from '../../list'

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
      extractionMethod: z.string(),
      fragmentHash: z.string().nullable().optional(),
      fragment: z.number().nullable().optional(),
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
            scope: z.enum(['library', 'file', 'file-part']).optional(),
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
      contextFullContent: z
        .object({
          maxContentTokens: z.number().optional(),
        })
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
      webFetchResults: z
        .array(
          z.object({
            url: z.string(),
            content: z.string(),
          }),
        )
        .optional(),
      fullContent: z
        .object({
          fileName: z.string(),
          content: z.string(),
        })
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
