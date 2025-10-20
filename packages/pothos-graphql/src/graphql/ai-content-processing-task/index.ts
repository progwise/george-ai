import {
  getEmbeddingStatus,
  getExtractionStatus,
  getProcessingStatus,
} from '../../domain/content-extraction/task-status'
import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: AiFileContentExtractionTask')

builder.prismaObject('AiContentExtractionSubTask', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
    markdownFileName: t.exposeString('markdownFileName', { nullable: true }),
    startedAt: t.expose('startedAt', { type: 'DateTime', nullable: true }),
    finishedAt: t.expose('finishedAt', { type: 'DateTime', nullable: true }),
    failedAt: t.expose('failedAt', { type: 'DateTime', nullable: true }),
    contentProcessingTaskId: t.exposeString('contentProcessingTaskId', { nullable: false }),
    contentProcessingTask: t.relation('contentProcessingTask', { nullable: false }),
  }),
})

// AiFileContentExtractionTask GraphQL Object
builder.prismaObject('AiContentProcessingTask', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    extractionSubTasks: t.relation('extractionSubTasks', { nullable: false }),
    timeoutMs: t.exposeInt('timeoutMs', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),

    // Processing phase timestamps
    processingCancelled: t.expose('processingCancelled', { type: 'Boolean', nullable: false }),
    processingStartedAt: t.expose('processingStartedAt', { type: 'DateTime', nullable: true }),
    processingFinishedAt: t.expose('processingFinishedAt', { type: 'DateTime', nullable: true }),
    processingFailedAt: t.expose('processingFailedAt', { type: 'DateTime', nullable: true }),
    processingTimeout: t.expose('processingTimeout', { type: 'Boolean', nullable: false }),
    processingTimeMs: t.field({
      type: 'Int',
      nullable: true,
      resolve: (task) => {
        if (task.processingStartedAt && task.processingFinishedAt) {
          return task.processingFinishedAt.getTime() - task.processingStartedAt.getTime()
        }
        return null
      },
    }),

    // Extraction phase timestamps
    extractionStartedAt: t.expose('extractionStartedAt', { type: 'DateTime', nullable: true }),
    extractionFinishedAt: t.expose('extractionFinishedAt', { type: 'DateTime', nullable: true }),
    extractionFailedAt: t.expose('extractionFailedAt', { type: 'DateTime', nullable: true }),
    extractionTimeout: t.expose('extractionTimeout', { type: 'Boolean', nullable: false }),
    extractionTimeMs: t.field({
      type: 'Int',
      nullable: true,
      resolve: (task) => {
        if (task.extractionStartedAt && task.extractionFinishedAt) {
          return task.extractionFinishedAt.getTime() - task.extractionStartedAt.getTime()
        }
        return null
      },
    }),

    // Embedding phase timestamps
    embeddingStartedAt: t.expose('embeddingStartedAt', { type: 'DateTime', nullable: true }),
    embeddingFinishedAt: t.expose('embeddingFinishedAt', { type: 'DateTime', nullable: true }),
    embeddingFailedAt: t.expose('embeddingFailedAt', { type: 'DateTime', nullable: true }),
    embeddingTimeout: t.expose('embeddingTimeout', { type: 'Boolean', nullable: false }),
    embeddingTimeMs: t.field({
      type: 'Int',
      nullable: true,
      resolve: (task) => {
        if (task.embeddingStartedAt && task.embeddingFinishedAt) {
          return task.embeddingFinishedAt.getTime() - task.embeddingStartedAt.getTime()
        }
        return null
      },
    }),

    // Result data
    chunksCount: t.exposeInt('chunksCount', { nullable: true }),
    chunksSize: t.exposeInt('chunksSize', { nullable: true }),
    embeddingModelName: t.exposeString('embeddingModelName', { nullable: true }),

    // Metadata
    metadata: t.exposeString('metadata', { nullable: true }),
    extractionOptions: t.exposeString('extractionOptions', { nullable: true }),

    // Relations
    file: t.relation('file', { nullable: false }),
    library: t.relation('library', { nullable: false }),

    // Computed fields
    extractionStatus: t.field({
      type: 'ExtractionStatus',
      nullable: false,
      resolve: (task) => getExtractionStatus(task),
    }),

    embeddingStatus: t.field({
      type: 'EmbeddingStatus',
      nullable: false,
      resolve: (task) => getEmbeddingStatus(task),
    }),

    processingStatus: t.field({
      type: 'ProcessingStatus',
      nullable: false,
      resolve: (task) => getProcessingStatus(task),
    }),
  }),
})
