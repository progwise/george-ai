import { EnrichmentMetadata } from '../../domain'
import { builder } from '../builder'

const AiEnrichmentTaskProcessingDataInput = builder
  .objectRef<NonNullable<EnrichmentMetadata['input']>>('AiEnrichmentTaskProcessingDataInput')
  .implement({
    fields: (t) => ({
      fileId: t.exposeString('fileId', { nullable: false }),
      fileName: t.exposeString('fileName', { nullable: false }),
      libraryId: t.exposeString('libraryId', { nullable: false }),
      libraryName: t.exposeString('libraryName', { nullable: false }),
      aiModelProvider: t.exposeString('aiModelProvider', { nullable: true }),
      aiModelName: t.exposeString('aiModelName', { nullable: false }),
      aiGenerationPrompt: t.exposeString('aiGenerationPrompt', { nullable: false }),
      contextFields: t.field({
        type: [
          builder
            .objectRef<NonNullable<EnrichmentMetadata['input']>['contextFields'][number]>('EnrichmentTaskContextField')
            .implement({
              fields: (t) => ({
                fieldId: t.exposeString('fieldId', { nullable: false }),
                fieldName: t.exposeString('fieldName', { nullable: false }),
                value: t.exposeString('value', { nullable: true }),
                errorMessage: t.exposeString('errorMessage', { nullable: true }),
              }),
            }),
        ],
        nullable: false,
        resolve: (parent) => parent.contextFields,
      }),
      dataType: t.field({ nullable: false, type: 'ListFieldType', resolve: (parent) => parent.dataType }),
      libraryEmbeddingModel: t.exposeString('libraryEmbeddingModel', { nullable: true }),
      contentQuery: t.exposeString('contentQuery', { nullable: true }),
      useVectorStore: t.exposeBoolean('useVectorStore', { nullable: false }),
    }),
  })

const AiEnrichmentTaskProcessingDataOutput = builder
  .objectRef<NonNullable<EnrichmentMetadata['output']>>('AiEnrichmentTaskProcessingDataOutput')
  .implement({
    fields: (t) => ({
      messages: t.field({
        type: [
          builder
            .objectRef<NonNullable<EnrichmentMetadata['output']>['messages'][number]>('EnrichmentTaskMessage')
            .implement({
              fields: (t) => ({
                role: t.exposeString('role', { nullable: false }),
                content: t.exposeString('content', { nullable: false }),
              }),
            }),
        ],
        nullable: false,
        resolve: (parent) => parent.messages || [],
      }),
      similarChunks: t.field({
        type: [
          builder
            .objectRef<
              NonNullable<NonNullable<EnrichmentMetadata['output']>['similarChunks']>[number]
            >('EnrichmentTaskSimilarChunk')
            .implement({
              fields: (t) => ({
                id: t.exposeString('id', { nullable: false }),
                fileName: t.exposeString('fileName', { nullable: false }),
                fileId: t.exposeString('fileId', { nullable: false }),
                text: t.exposeString('text', { nullable: false }),
                distance: t.exposeFloat('distance', { nullable: false }),
              }),
            }),
        ],
        nullable: true,
        resolve: (parent) => parent?.similarChunks,
      }),
      aiInstance: t.exposeString('aiInstance', { nullable: true }),
      enrichedValue: t.exposeString('enrichedValue', { nullable: true }),
      issues: t.exposeStringList('issues', { nullable: false }),
    }),
  })

export const AiEnrichmentTaskProcessingData = builder
  .objectRef<EnrichmentMetadata>('AiEnrichmentTaskProcessingData')
  .implement({
    fields: (t) => ({
      input: t.field({ type: AiEnrichmentTaskProcessingDataInput, nullable: true, resolve: (parent) => parent.input }),
      output: t.field({
        type: AiEnrichmentTaskProcessingDataOutput,
        nullable: true,
        resolve: (parent) => parent.output,
      }),
    }),
  })
