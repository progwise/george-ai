import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../../domain/content-extraction/types'
import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiFileContentExtractionTask')

export const ProcessingStatus = builder.enumType('ProcessingStatus', {
  values: PROCESSING_STATUS,
})

export const EmbeddingStatus = builder.enumType('EmbeddingStatus', {
  values: EMBEDDING_STATUS,
})

export const ExtractionStatus = builder.enumType('ExtractionStatus', {
  values: EXTRACTION_STATUS,
})

// AiFileContentExtractionTask GraphQL Object
builder.prismaObject('AiFileContentExtractionTask', {
  fields: (t) => ({
    id: t.exposeID('id'),
    fileId: t.exposeString('fileId'),
    libraryId: t.exposeString('libraryId'),
    extractionMethod: t.exposeString('extractionMethod'),
    timeoutMs: t.exposeInt('timeoutMs', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),

    // Processing phase timestamps
    processingStartedAt: t.expose('processingStartedAt', { type: 'DateTime', nullable: true }),
    processingFinishedAt: t.expose('processingFinishedAt', { type: 'DateTime', nullable: true }),
    processingFailedAt: t.expose('processingFailedAt', { type: 'DateTime', nullable: true }),
    processingTimeout: t.expose('processingTimeout', { type: 'Boolean', nullable: false }),

    // Extraction phase timestamps
    extractionStartedAt: t.expose('extractionStartedAt', { type: 'DateTime', nullable: true }),
    extractionFinishedAt: t.expose('extractionFinishedAt', { type: 'DateTime', nullable: true }),
    extractionFailedAt: t.expose('extractionFailedAt', { type: 'DateTime', nullable: true }),
    extractionTimeout: t.expose('extractionTimeout', { type: 'Boolean', nullable: false }),

    // Embedding phase timestamps
    embeddingStartedAt: t.expose('embeddingStartedAt', { type: 'DateTime', nullable: true }),
    embeddingFinishedAt: t.expose('embeddingFinishedAt', { type: 'DateTime', nullable: true }),
    embeddingFailedAt: t.expose('embeddingFailedAt', { type: 'DateTime', nullable: true }),
    embeddingTimeout: t.expose('embeddingTimeout', { type: 'Boolean', nullable: false }),

    // Result data
    markdownFileName: t.exposeString('markdownFileName', { nullable: true }),
    chunksCount: t.exposeInt('chunksCount', { nullable: true }),
    chunksSize: t.exposeInt('chunksSize', { nullable: true }),
    embeddingModelName: t.exposeString('embeddingModelName', { nullable: true }),

    // Metadata
    metadata: t.exposeString('metadata', { nullable: true }),
    extractionOptions: t.exposeString('extractionOptions', { nullable: true }),
    extractionConfidenceScore: t.exposeFloat('extractionConfidenceScore', { nullable: true }),
    embeddingConfidenceScore: t.exposeFloat('embeddingConfidenceScore', { nullable: true }),

    // Relations
    file: t.relation('file'),
    library: t.relation('library'),

    // Computed fields
    extractionStatus: t.field({
      type: 'String',
      nullable: false,
      resolve: (task) => {
        if (task.extractionFailedAt) return 'failed'
        if (task.extractionFinishedAt) return 'completed'
        if (task.extractionStartedAt) return 'running'
        return 'pending'
      },
    }),

    embeddingStatus: t.field({
      type: 'String',
      nullable: false,
      resolve: (task) => {
        if (task.embeddingFailedAt) return 'failed'
        if (task.embeddingFinishedAt) return 'completed'
        if (task.embeddingStartedAt) return 'running'
        return 'pending'
      },
    }),

    ProcessingStatus: t.field({
      type: 'String',
      nullable: false,
      resolve: (task) => {
        if (task.processingTimeout) return 'timed-out'
        if (task.embeddingFailedAt) return 'embedding-failed'
        if (task.embeddingFinishedAt) return 'embedding-finished'
        if (task.embeddingStartedAt) return 'embedding'
        if (task.extractionFailedAt) return 'extraction-failed'
        if (task.extractionFinishedAt) return 'extraction-finished'
        if (task.extractionStartedAt) return 'extracting'
        if (task.processingFailedAt) return 'validation-failed'
        if (task.processingFinishedAt) return 'completed'
        if (task.processingStartedAt) return 'validating'
        return 'pending'
      },
    }),
  }),
})
