import {
  DocumentExtractionRequest,
  DocumentVectorizationRequest,
  EventQueueRequest,
  FieldEnrichmentRequest,
  MigrateFileRequest,
} from '@george-ai/event-service-client'

import { builder } from '../builder'
import { logger } from '../common'

builder.interfaceRef<EventQueueRequest>('EventQueueRequest').implement({
  resolveType: (request) => {
    switch (request.action) {
      case 'documentExtraction':
        return 'DocumentExtractionRequest'
      case 'documentVectorization':
        return 'DocumentVectorizationRequest'
      case 'fieldEnrichment':
        return 'FieldEnrichmentRequest'
      case 'migrateFile':
        return 'MigrateFileRequest'
      default:
        logger.error('Unknown request type for EventQueueRequest', { request })
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        throw new Error(`Unknown request type: ${request.action}`)
    }
  },
  // TODO: add fileId and libraryId to the interface and remove from individual types, since they are common across all types
  fields: (t) => ({
    version: t.exposeInt('version'),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    action: t.field({ type: 'EventQueueAction', nullable: false, resolve: (root) => root.action }),
    timestamp: t.field({ type: 'DateTime', nullable: false, resolve: (root) => root.timestamp }),
  }),
})

builder.objectRef<DocumentExtractionRequest>('DocumentExtractionRequest').implement({
  interfaces: ['EventQueueRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
  }),
})

builder.objectRef<DocumentVectorizationRequest>('DocumentVectorizationRequest').implement({
  interfaces: ['EventQueueRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId', { nullable: false }),
    documentId: t.exposeString('documentId', { nullable: false }),
    extractionMethod: t.exposeString('extractionMethod', { nullable: false }),
    splitMethod: t.exposeString('splitMethod', { nullable: false }), // TODO
    embeddingDriver: t.field({ type: 'InferenceDriver', resolve: (root) => root.embeddingDriver }),
    embeddingModel: t.exposeString('embeddingModel', { nullable: false }),
  }),
})

builder.objectRef<FieldEnrichmentRequest>('FieldEnrichmentRequest').implement({
  interfaces: ['EventQueueRequest'],
  fields: (t) => ({
    fieldId: t.exposeString('fieldId', { nullable: false }),
    chatModelDriver: t.field({ type: 'InferenceDriver', nullable: false, resolve: (root) => root.chatModelDriver }),
    chatModelName: t.exposeString('chatModelName', { nullable: false }),
    valuePrompt: t.exposeString('valuePrompt', { nullable: false }),
    valueFormat: t.exposeString('valueFormat', { nullable: false }), // TODO
    notFoundValue: t.exposeString('notFoundValue'),
    context: t.field({ type: ['String'], nullable: false, resolve: (root) => root.context }),
  }),
})

builder.objectRef<MigrateFileRequest>('MigrateFileRequest').implement({
  interfaces: ['EventQueueRequest'],
  fields: (t) => ({
    libraryId: t.exposeString('libraryId', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    originUri: t.exposeString('originUri'),
    crawledByCrawlerId: t.exposeString('crawledByCrawlerId'),
    docPath: t.exposeString('docPath'),
    originFileHash: t.exposeString('originFileHash'),
    originModificationDate: t.exposeString('originModificationDate'),
    createdAt: t.exposeString('createdAt', { nullable: false }),
    uploadedAt: t.exposeString('uploadedAt'),
    hash: t.exposeString('hash'),
  }),
})
